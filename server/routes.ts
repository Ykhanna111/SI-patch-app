import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertGameSchema } from "@shared/schema";
import { generateSudoku, solveSudoku, isValidMove, getHint } from "./services/sudokuGenerator";
import { generatePuzzleForMode, isValidMoveForMode } from "./services/gameModeGenerators";
import { GameMode, Difficulty } from "@shared/gameTypes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Note: Auth routes are now handled in auth.ts setupAuth function

  // Game routes
  app.post('/api/games', async (req, res) => {
    try {
      const { difficulty, gameMode = 'standard' } = req.body;
      
      if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      const validGameModes = ['standard', 'mini-4x4', 'mini-6x6', 'hexadoku', 'jigsaw', 'diagonal', 'killer', 'hyper', 'odd-even', 'inequality', 'consecutive'];
      if (!validGameModes.includes(gameMode)) {
        return res.status(400).json({ message: "Invalid game mode" });
      }

      // Generate puzzle based on game mode
      let puzzle, solution, constraints;
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
      
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.put('/api/games/:id', async (req, res) => {
    try {
      const { currentState, timeElapsed, mistakes, hintsUsed, isCompleted, moves } = req.body;
      
      const updates: any = {};
      if (currentState !== undefined) updates.currentState = JSON.stringify(currentState);
      if (timeElapsed !== undefined) updates.timeElapsed = timeElapsed;
      if (mistakes !== undefined) updates.mistakes = mistakes;
      if (hintsUsed !== undefined) updates.hintsUsed = hintsUsed;
      if (isCompleted !== undefined) updates.isCompleted = isCompleted;
      if (moves !== undefined) updates.moves = JSON.stringify(moves);

      const game = await storage.updateGame(req.params.id, updates);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.get('/api/games/user/active', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const game = await storage.getActiveGame(userId);
      res.json(game);
    } catch (error) {
      console.error("Error fetching active game:", error);
      res.status(500).json({ message: "Failed to fetch active game" });
    }
  });

  app.post('/api/games/:id/validate', async (req, res) => {
    try {
      const { row, col, value, currentState } = req.body;
      const game = await storage.getGame(req.params.id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const puzzle = JSON.parse(game.puzzle);
      const gameMode = game.gameMode || 'standard';
      const constraints = game.constraints ? JSON.parse(game.constraints) : undefined;
      
      let isValid: boolean;
      if (gameMode === 'standard' || gameMode === 'diagonal') {
        isValid = isValidMove(currentState, row, col, value, puzzle, gameMode);
      } else {
        isValid = isValidMoveForMode(gameMode as GameMode, currentState, row, col, value, puzzle, constraints);
      }
      
      res.json({ isValid });
    } catch (error) {
      console.error("Error validating move:", error);
      res.status(500).json({ message: "Failed to validate move" });
    }
  });

  app.post('/api/games/:id/hint', async (req, res) => {
    try {
      const { currentState } = req.body;
      const game = await storage.getGame(req.params.id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const solution = JSON.parse(game.solution);
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
