import {
  users,
  games,
  userStats,
  type User,
  type InsertUser,
  type Game,
  type InsertGame,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  getGame(id: string): Promise<Game | undefined>;
  getUserGames(userId: string): Promise<Game[]>;
  getActiveGame(userId: string): Promise<Game | undefined>;
  
  // Statistics operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private games: Map<string, Game> = new Map();
  private stats: Map<string, UserStats> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    return this.usersByEmail.get(email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: nanoid(),
      username: userData.username,
      email: userData.email || null,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      avatarUrl: userData.avatarUrl || null,
      bio: userData.bio || null,
      phoneNumber: userData.phoneNumber || null,
      location: userData.location || null,
      preferences: userData.preferences || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    if (user.email) {
      this.usersByEmail.set(user.email, user);
    }
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const oldEmail = user.email;
    const oldUsername = user.username;
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    
    if (oldUsername !== updatedUser.username) {
      this.usersByUsername.delete(oldUsername);
    }
    this.usersByUsername.set(updatedUser.username, updatedUser);
    
    if (oldEmail && oldEmail !== updatedUser.email) {
      this.usersByEmail.delete(oldEmail);
    }
    if (updatedUser.email) {
      this.usersByEmail.set(updatedUser.email, updatedUser);
    }

    return updatedUser;
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const game: Game = {
      id: nanoid(),
      userId: gameData.userId || null,
      gameMode: gameData.gameMode || "standard",
      gridSize: gameData.gridSize || 9,
      difficulty: gameData.difficulty,
      puzzle: gameData.puzzle,
      currentState: gameData.currentState,
      solution: gameData.solution,
      constraints: gameData.constraints || null,
      timeElapsed: gameData.timeElapsed || 0,
      mistakes: gameData.mistakes || 0,
      hintsUsed: gameData.hintsUsed || 0,
      isCompleted: gameData.isCompleted || false,
      moves: gameData.moves || null,
      completedAt: gameData.completedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.games.set(game.id, game);
    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    const updatedGame: Game = {
      ...game,
      ...updates,
      updatedAt: new Date(),
    };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getUserGames(userId: string): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.userId === userId)
      .sort((a, b) => {
        const timeA = a.updatedAt?.getTime() || 0;
        const timeB = b.updatedAt?.getTime() || 0;
        return timeB - timeA;
      });
  }

  async getActiveGame(userId: string): Promise<Game | undefined> {
    const userGames = Array.from(this.games.values())
      .filter(game => game.userId === userId && !game.isCompleted)
      .sort((a, b) => {
        const timeA = a.updatedAt?.getTime() || 0;
        const timeB = b.updatedAt?.getTime() || 0;
        return timeB - timeA;
      });
    return userGames[0];
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return Array.from(this.stats.values()).find(s => s.userId === userId);
  }

  async createUserStats(statsData: InsertUserStats): Promise<UserStats> {
    const stats: UserStats = {
      id: nanoid(),
      userId: statsData.userId,
      totalPuzzlesPlayed: statsData.totalPuzzlesPlayed || 0,
      totalPuzzlesSolved: statsData.totalPuzzlesSolved || 0,
      currentStreak: statsData.currentStreak || 0,
      longestStreak: statsData.longestStreak || 0,
      totalMistakes: statsData.totalMistakes || 0,
      totalTimeSpent: statsData.totalTimeSpent || 0,
      bestTimeEasy: statsData.bestTimeEasy || null,
      bestTimeMedium: statsData.bestTimeMedium || null,
      bestTimeHard: statsData.bestTimeHard || null,
      bestTimeExpert: statsData.bestTimeExpert || null,
      lastPlayedAt: statsData.lastPlayedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stats.set(stats.id, stats);
    return stats;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const stats = Array.from(this.stats.values()).find(s => s.userId === userId);
    if (!stats) return undefined;

    const updatedStats: UserStats = {
      ...stats,
      ...updates,
      updatedAt: new Date(),
    };
    this.stats.set(stats.id, updatedStats);
    return updatedStats;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Game operations
  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const [updatedGame] = await db
      .update(games)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return updatedGame;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getUserGames(userId: string): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.updatedAt));
  }

  async getActiveGame(userId: string): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(and(eq(games.userId, userId), eq(games.isCompleted, false)))
      .orderBy(desc(games.updatedAt))
      .limit(1);
    return game;
  }

  // Statistics operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async createUserStats(statsData: InsertUserStats): Promise<UserStats> {
    const [stats] = await db.insert(userStats).values(statsData).returning();
    return stats;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const [updatedStats] = await db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return updatedStats;
  }
}

export const storage = new DatabaseStorage();
