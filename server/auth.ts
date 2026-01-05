import bcrypt from 'bcryptjs';
import type { Express, RequestHandler, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { storage } from './storage';
import { loginSchema, registerSchema, type LoginInput } from '../shared/schema';
import crypto from 'crypto';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    csrfToken: string;
    guestId: string;
    guestGamesPlayed: number;
    guestLastPlayDate: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: 86400000
  });
  
  return session({
    name: 'sudoku.sid',
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: false, // 🔑 REQUIRED on Render
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/',
    },
    rolling: true,
    unset: 'destroy',
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function setupAuth(app: Express) {
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }
      const data = validation.data;
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      if (data.email && data.email.trim() !== "") {
        const existingEmailUser = await storage.getUserByEmail(data.email);
        if (existingEmailUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error during registration:', err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        // Return user without password for frontend
        const safeUser = { ...user };
        delete (safeUser as any).password;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const data = validation.data;
      
      let user;
      if (data.identifier.includes('@')) {
        user = await storage.getUserByEmail(data.identifier);
      } else {
        user = await storage.getUserByUsername(data.identifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // We need to cast or access the password from the underlying storage result
      // since the select schema might omit it but the database object has it
      const dbUser = user as any;
      const isValid = await verifyPassword(data.password, dbUser.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error during login:', err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        // Return user without password for frontend
        const safeUser = { ...user };
        delete (safeUser as any).password;
        res.json(safeUser);
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('sudoku.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      if (req.session && req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const safeUser = { ...user };
          delete (safeUser as any).password;
          return res.json(safeUser);
        }
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
}

