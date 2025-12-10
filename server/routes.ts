import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertGameSchema } from "@shared/schema";
import { generateSudoku, isValidMove, getHint } from "./services/sudokuGenerator";
import { generatePuzzleForMode, isValidMoveForMode } from "./services/gameModeGenerators";
import { GameMode, Difficulty } from "@shared/gameTypes";
import { 
  hasUniqueSolution, 
  validateMoveAgainstSolution, 
  checkPuzzleCompletion,
  validatePuzzleIntegrity 
} from "./services/puzzleValidator";
import {
  securityHeaders,
  csrfProtection,
  csrfTokenEndpoint,
  rateLimit,
  checkGuestLimit,
  incrementGuestGames,
  isUserAuthenticated,
  sanitizeGameForClient,
  getGuestDailyLimit
} from "./middleware/security";

const GUEST_ALLOWED_MODES = ['standard', 'mini-4x4'];
const GUEST_ALLOWED_DIFFICULTIES = ['easy', 'medium'];
const MAX_PUZZLE_GENERATION_ATTEMPTS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(securityHeaders());
  
  await setupAuth(app);
  
  app.use(rateLimit());
  
  app.get('/api/csrf-token', csrfTokenEndpoint());
  
  app.get('/api/guest/status', (req: Request, res: Response) => {
    const isAuth = isUserAuthenticated(req);
    const limitInfo = checkGuestLimit(req);
    
    res.json({
      isAuthenticated: isAuth,
      guestMode: !isAuth,
      dailyLimit: isAuth ? null : getGuestDailyLimit(),
      gamesRemaining: isAuth ? null : limitInfo.remaining,
      allowedModes: isAuth ? null : GUEST_ALLOWED_MODES,
      allowedDifficulties: isAuth ? null : GUEST_ALLOWED_DIFFICULTIES
    });
  });

  app.post('/api/games', csrfProtection(), async (req: Request, res: Response) => {
    try {
      const { difficulty, gameMode = 'standard' } = req.body;
      const isAuth = isUserAuthenticated(req);
      
      if (!isAuth) {
        const limitCheck = checkGuestLimit(req);
        if (!limitCheck.allowed) {
          return res.status(403).json({ 
            message: limitCheck.message,
            upgradeRequired: true
          });
        }
        
        if (!GUEST_ALLOWED_MODES.includes(gameMode)) {
          return res.status(403).json({ 
            message: `Game mode '${gameMode}' requires an account. Please sign up for full access.`,
            upgradeRequired: true
          });
        }
        
        if (!GUEST_ALLOWED_DIFFICULTIES.includes(difficulty)) {
          return res.status(403).json({ 
            message: `Difficulty '${difficulty}' requires an account. Please sign up for full access.`,
            upgradeRequired: true
          });
        }
      }
      
      if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      const validGameModes = ['standard', 'mini-4x4', 'mini-6x6', 'hexadoku', 'jigsaw', 'diagonal', 'killer', 'hyper', 'odd-even', 'inequality', 'consecutive'];
      if (!validGameModes.includes(gameMode)) {
        return res.status(400).json({ message: "Invalid game mode" });
      }

      let puzzle, solution, constraints;
      let attempts = 0;
      let hasUnique = false;
      
      while (attempts < MAX_PUZZLE_GENERATION_ATTEMPTS && !hasUnique) {
        if (gameMode === 'standard' || gameMode === 'diagonal') {
          const result = generateSudoku(difficulty, gameMode);
          puzzle = result.puzzle;
          solution = result.solution;
        } else {
          const result = generatePuzzleForMode(gameMode as GameMode, difficulty as Difficulty);
          puzzle = result.puzzle;
          solution = result.solution;
          constraints = result.constraints;
        }
        
        if (gameMode === 'standard' || gameMode === 'diagonal') {
          hasUnique = hasUniqueSolution(puzzle, gameMode);
        } else {
          hasUnique = true;
        }
        
        attempts++;
      }
      
      if (!hasUnique && (gameMode === 'standard' || gameMode === 'diagonal')) {
        console.error(`Failed to generate unique puzzle after ${MAX_PUZZLE_GENERATION_ATTEMPTS} attempts`);
        return res.status(500).json({ message: "Failed to generate a valid puzzle. Please try again." });
      }
      
      if (!puzzle || !solution || !validatePuzzleIntegrity(puzzle, solution)) {
        console.error("Puzzle integrity validation failed");
        return res.status(500).json({ message: "Failed to generate a valid puzzle. Please try again." });
      }

      const gridSize = gameMode === 'mini-4x4' ? 4 : gameMode === 'mini-6x6' ? 6 : gameMode === 'hexadoku' ? 16 : 9;
      
      const gameData = {
        userId: req.session?.userId || null,
        gameMode,
        gridSize,
        difficulty,
        puzzle: JSON.stringify(puzzle),
        currentState: JSON.stringify(puzzle),
        solution: JSON.stringify(solution),
        constraints: constraints ? JSON.stringify(constraints) : null,
        moves: JSON.stringify([]),
      };

      const validatedData = insertGameSchema.parse(gameData);
      const game = await storage.createGame(validatedData);
      
      if (!isAuth) {
        incrementGuestGames(req);
      }
      
      const sanitizedGame = sanitizeGameForClient(game, isAuth);
      res.json(sanitizedGame);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get('/api/games/:id', async (req: Request, res: Response) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const isAuth = isUserAuthenticated(req);
      
      if (game.userId && game.userId !== req.session?.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const sanitizedGame = sanitizeGameForClient(game, isAuth);
      res.json(sanitizedGame);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.put('/api/games/:id', csrfProtection(), async (req: Request, res: Response) => {
    try {
      const { currentState, timeElapsed, mistakes, hintsUsed, moves } = req.body;
      
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.userId && game.userId !== req.session?.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (game.isCompleted) {
        return res.status(400).json({ message: "Cannot update a completed game" });
      }
      
      const updates: Record<string, unknown> = {};
      if (currentState !== undefined) {
        if (!Array.isArray(currentState)) {
          return res.status(400).json({ message: "Invalid current state format" });
        }
        updates.currentState = JSON.stringify(currentState);
      }
      if (typeof timeElapsed === 'number' && timeElapsed >= 0) {
        updates.timeElapsed = Math.floor(timeElapsed);
      }
      if (typeof mistakes === 'number' && mistakes >= 0) {
        updates.mistakes = Math.floor(mistakes);
      }
      if (typeof hintsUsed === 'number' && hintsUsed >= 0) {
        updates.hintsUsed = Math.floor(hintsUsed);
      }
      if (moves !== undefined && Array.isArray(moves)) {
        updates.moves = JSON.stringify(moves);
      }

      const updatedGame = await storage.updateGame(req.params.id, updates);
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const isAuth = isUserAuthenticated(req);
      const sanitizedGame = sanitizeGameForClient(updatedGame, isAuth);
      res.json(sanitizedGame);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.get('/api/games/user/active', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const game = await storage.getActiveGame(userId);
      
      if (game) {
        const sanitizedGame = sanitizeGameForClient(game, true);
        res.json(sanitizedGame);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching active game:", error);
      res.status(500).json({ message: "Failed to fetch active game" });
    }
  });

  app.post('/api/games/:id/validate', csrfProtection(), async (req: Request, res: Response) => {
    try {
      const { row, col, value, currentState } = req.body;
      
      if (typeof row !== 'number' || typeof col !== 'number' || typeof value !== 'number') {
        return res.status(400).json({ message: "Invalid input parameters" });
      }
      
      if (row < 0 || col < 0 || value < 1) {
        return res.status(400).json({ message: "Invalid cell coordinates or value" });
      }
      
      const game = await storage.getGame(req.params.id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.userId && game.userId !== req.session?.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const puzzle = JSON.parse(game.puzzle);
      const solution = JSON.parse(game.solution);
      const gameMode = game.gameMode || 'standard';
      const constraints = game.constraints ? JSON.parse(game.constraints) : undefined;
      
      const isCorrect = validateMoveAgainstSolution(solution, row, col, value);
      
      let isValidPlacement: boolean;
      if (gameMode === 'standard' || gameMode === 'diagonal') {
        isValidPlacement = isValidMove(currentState, row, col, value, puzzle, gameMode);
      } else {
        isValidPlacement = isValidMoveForMode(gameMode as GameMode, currentState, row, col, value, puzzle, constraints);
      }
      
      res.json({ 
        isValid: isValidPlacement,
        isCorrect: isCorrect
      });
    } catch (error) {
      console.error("Error validating move:", error);
      res.status(500).json({ message: "Failed to validate move" });
    }
  });

  app.post('/api/games/:id/check-completion', csrfProtection(), async (req: Request, res: Response) => {
    try {
      const { currentState } = req.body;
      
      if (!Array.isArray(currentState)) {
        return res.status(400).json({ message: "Invalid current state" });
      }
      
      const game = await storage.getGame(req.params.id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.userId && game.userId !== req.session?.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const solution = JSON.parse(game.solution);
      const isComplete = checkPuzzleCompletion(currentState, solution);
      
      if (isComplete && !game.isCompleted) {
        await storage.updateGame(req.params.id, {
          isCompleted: true,
          completedAt: new Date(),
          currentState: JSON.stringify(currentState)
        });
      }
      
      res.json({ isComplete });
    } catch (error) {
      console.error("Error checking completion:", error);
      res.status(500).json({ message: "Failed to check completion" });
    }
  });

  app.post('/api/games/:id/hint', csrfProtection(), async (req: Request, res: Response) => {
    try {
      const { currentState } = req.body;
      
      if (!Array.isArray(currentState)) {
        return res.status(400).json({ message: "Invalid current state" });
      }
      
      const game = await storage.getGame(req.params.id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.userId && game.userId !== req.session?.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const isAuth = isUserAuthenticated(req);
      const maxHints = isAuth ? Infinity : 3;
      
      if (!isAuth && (game.hintsUsed || 0) >= maxHints) {
        return res.status(403).json({ 
          message: "Hint limit reached. Sign up for unlimited hints!",
          upgradeRequired: true
        });
      }

      const solution = JSON.parse(game.solution);
      const hint = getHint(currentState, solution);
      
      if (hint) {
        await storage.updateGame(req.params.id, {
          hintsUsed: (game.hintsUsed || 0) + 1
        });
      }
      
      res.json(hint);
    } catch (error) {
      console.error("Error getting hint:", error);
      res.status(500).json({ message: "Failed to get hint" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
