import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
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
  getGuestDailyLimit
} from "./middleware/security";

const GUEST_ALLOWED_MODES = ['standard', 'diagonal', 'hyper', 'odd-even', 'hexadoku', 'killer'];
const GUEST_ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];
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

  app.post('/api/games', async (req: Request, res: Response) => {
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

      const validGameModes = ['standard', 'hexadoku', 'diagonal', 'killer', 'hyper', 'odd-even'];
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

      const gridSize = gameMode === 'hexadoku' ? 16 : 9;
      
      // Since we no longer persist games to the database, we just return the generated data
      // along with a temporary ID for tracking in memory on the client side
      const game = {
        id: Math.random().toString(36).substring(2, 15),
        gameMode,
        gridSize,
        difficulty,
        puzzle: JSON.stringify(puzzle),
        currentState: JSON.stringify(puzzle),
        solution: JSON.stringify(solution),
        constraints: constraints ? JSON.stringify(constraints) : null,
        moves: JSON.stringify([]),
        isCompleted: false,
        timeElapsed: 0,
        mistakes: 0,
        hintsUsed: 0,
      };
      
      if (!isAuth) {
        incrementGuestGames(req);
      }
      
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get('/api/games/:id', async (req: Request, res: Response) => {
    // Game state is now held in the client, but we might have a placeholder route
    res.status(404).json({ message: "Game persistence is disabled. Game state is managed on the client." });
  });

  app.put('/api/games/:id', async (req: Request, res: Response) => {
    // Game update logic is now primarily handled on the client
    // We could implement state sync here if needed, but per requirements we just track stats
    res.json({ success: true, message: "Stats will be updated upon completion" });
  });

  app.get('/api/games/user/active', isAuthenticated, async (req: Request, res: Response) => {
    // Since games are not saved, there's no active game to fetch from database
    res.json(null);
  });


  app.post('/api/games/:id/validate', async (req: Request, res: Response) => {
    try {
      const isAuth = isUserAuthenticated(req);
      
      // Guest mode: trust client-side validation as we don't persist state on server
      if (!isAuth) {
        return res.json({ 
          isValid: true,
          isCorrect: null 
        });
      }

      const { row, col, value, currentState, solution, gameMode = 'standard', constraints } = req.body;
      
      if (typeof row !== 'number' || typeof col !== 'number' || typeof value !== 'number') {
        return res.status(400).json({ message: "Invalid input parameters" });
      }
      
      const isCorrect = validateMoveAgainstSolution(solution, row, col, value);
      
      let isValidPlacement: boolean;
      if (gameMode === 'standard' || gameMode === 'diagonal') {
        isValidPlacement = isValidMove(currentState, row, col, value, req.body.puzzle, gameMode);
      } else {
        isValidPlacement = isValidMoveForMode(gameMode as GameMode, currentState, row, col, value, req.body.puzzle, constraints);
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

  app.post('/api/games/:id/check-completion', async (req: Request, res: Response) => {
    try {
      const { currentState } = req.body;
      
      if (typeof currentState === 'string') {
        // Handle case where it might be double stringified
      }
      
      const isComplete = checkPuzzleCompletion(currentState, req.body.solution);
      
      if (isComplete) {
        // Logic for updating stats would go here when an account is used
      }
      
      res.json({ isComplete });
    } catch (error) {
      console.error("Error checking completion:", error);
      res.status(500).json({ message: "Failed to check completion" });
    }
  });

  app.post('/api/games/:id/hint', async (req: Request, res: Response) => {
    try {
      const { currentState, solution, hintsUsed = 0 } = req.body;
      
      const isAuth = isUserAuthenticated(req);
      const maxHints = isAuth ? Infinity : 3;
      
      if (!isAuth && hintsUsed >= maxHints) {
        return res.status(403).json({ 
          message: "Hint limit reached. Sign up for unlimited hints!",
          upgradeRequired: true
        });
      }

      const hint = getHint(currentState, solution);
      res.json(hint);
    } catch (error) {
      console.error("Error getting hint:", error);
      res.status(500).json({ message: "Failed to get hint" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
