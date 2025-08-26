import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGameSchema } from "@shared/schema";
import { generateSudoku, solveSudoku, isValidMove, getHint } from "./services/sudokuGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game routes
  app.post('/api/games', async (req, res) => {
    try {
      const { difficulty } = req.body;
      
      if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      const { puzzle, solution } = generateSudoku(difficulty);
      
      const gameData = {
        userId: (req.user as any)?.claims?.sub || null,
        difficulty,
        puzzle: JSON.stringify(puzzle),
        currentState: JSON.stringify(puzzle),
        solution: JSON.stringify(solution),
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

  app.get('/api/games/user/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const isValid = isValidMove(currentState, row, col, value, puzzle);
      
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
