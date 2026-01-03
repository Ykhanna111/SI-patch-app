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
  id: varchar("id").primaryKey(), // UUID from Supabase Auth
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).unique(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  bio: text("bio"),
  preferences: jsonb("preferences").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  totalTimeSpent: integer("total_time_spent").default(0),
  bestTimeEasy: integer("best_time_easy"),
  bestTimeMedium: integer("best_time_medium"),
  bestTimeHard: integer("best_time_hard"),
  bestTimeExpert: integer("best_time_expert"),
  lastPlayedAt: timestamp("last_played_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registerSchema = z.object({
  id: z.string().uuid(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.record(z.any()).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof registerSchema>;
export type User = typeof users.$inferSelect;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
