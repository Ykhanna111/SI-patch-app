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
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

function validateOrigin(req: Request): boolean {
  const origin = req.get('origin');
  const host = req.get('host');
  
  if (!origin) {
    return true;
  }
  
  if (!host) {
    return false;
  }
  
  try {
    const originUrl = new URL(origin);
    const hostHostname = host.split(':')[0];
    
    if (originUrl.hostname === hostHostname) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

function csrfProtectionForAuth(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!validateOrigin(req)) {
      return res.status(403).json({ message: 'Forbidden: Invalid origin' });
    }
    
    const csrfToken = req.headers['x-csrf-token'] as string || req.body?._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return res.status(403).json({ 
        message: 'Authentication session expired. Please refresh the page and try again.',
        code: 'CSRF_INVALID'
      });
    }
    
    next();
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post('/api/auth/register', async (req, res) => {
    try {
      if (!validateOrigin(req)) {
        return res.status(403).json({ message: 'Forbidden: Invalid origin' });
      }
      
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

      // In a real Supabase Auth flow, the user would be created via Supabase Auth first,
      // and then this endpoint would be called to sync the public profile.
      const user = await storage.createUser(data);

      req.session.userId = user.id;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      req.session.save(() => {
        res.status(201).json({ ...user, csrfToken: req.session.csrfToken });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get('/api/auth/username/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      if (!validateOrigin(req)) {
        return res.status(403).json({ message: 'Forbidden: Invalid origin' });
      }
      
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const data = validation.data;
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // NOTE: With Supabase Auth, login should happen on the frontend using Supabase Client.
      // This is a placeholder for local development compatibility.
      req.session.userId = user.id;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      req.session.save(() => {
        res.json({ ...user, csrfToken: req.session.csrfToken });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', csrfProtectionForAuth(), (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.put('/api/auth/profile', isAuthenticated, csrfProtectionForAuth(), async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }

      const allowedUpdates = ['firstName', 'lastName', 'email', 'bio'];
      const updates: any = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/auth/stats', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }

      let stats = await storage.getUserStats(userId);
      
      if (!stats) {
        stats = await storage.createUserStats({ userId });
      }

      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });
}
