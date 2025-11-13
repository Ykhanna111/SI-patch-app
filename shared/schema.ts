import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  gameMode: varchar("game_mode").notNull().default("standard"), // 'standard', 'mini-4x4', 'mini-6x6', 'jigsaw', 'diagonal', 'hyper', 'odd-even', 'inequality', 'consecutive'
  gridSize: integer("grid_size").notNull().default(9), // 4, 6, or 9
  difficulty: varchar("difficulty").notNull(), // 'easy', 'medium', 'hard', 'expert'
  puzzle: text("puzzle").notNull(), // JSON string of the initial puzzle
  currentState: text("current_state").notNull(), // JSON string of current state
  solution: text("solution").notNull(), // JSON string of the solution
  constraints: text("constraints"), // JSON string of mode-specific constraints (cages, inequalities, etc.)
  timeElapsed: integer("time_elapsed").default(0), // in seconds
  mistakes: integer("mistakes").default(0),
  hintsUsed: integer("hints_used").default(0),
  isCompleted: boolean("is_completed").default(false),
  moves: text("moves"), // JSON string of move history for undo
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User statistics table
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  totalPuzzlesPlayed: integer("total_puzzles_played").default(0),
  totalPuzzlesSolved: integer("total_puzzles_solved").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalMistakes: integer("total_mistakes").default(0),
  totalTimeSpent: integer("total_time_spent").default(0), // in seconds
  bestTimeEasy: integer("best_time_easy"), // in seconds
  bestTimeMedium: integer("best_time_medium"),
  bestTimeHard: integer("best_time_hard"),
  bestTimeExpert: integer("best_time_expert"),
  lastPlayedAt: timestamp("last_played_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password validation schema
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .refine((password) => {
    if (password.includes(' ')) return false;
    
    const categories = [
      /[a-z]/.test(password), // lowercase
      /[A-Z]/.test(password), // uppercase
      /[0-9]/.test(password), // numbers
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) // special chars
    ];
    
    return categories.filter(Boolean).length >= 3;
  }, "Password must include at least 3 of: lowercase, uppercase, numbers, special characters")
  .refine((password) => {
    const commonPasswords = ['123456', 'password', 'qwerty', 'abc123', 'password123'];
    return !commonPasswords.includes(password.toLowerCase());
  }, "Password is too common");

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
}).refine((data) => {
  return data.password !== data.username && 
         (!data.email || data.email === "" || data.password !== data.email);
}, {
  message: "Password cannot match username or email",
  path: ["password"]
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
