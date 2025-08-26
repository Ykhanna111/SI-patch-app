import bcrypt from 'bcryptjs';
import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { RegisterInput, LoginInput } from '../shared/schema';
import { registerSchema } from '../shared/schema';

// Extend session data type
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
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

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate input using the schema
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }
      const data = validation.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists (if provided)
      if (data.email && data.email.trim() !== "") {
        const existingEmailUser = await storage.getUserByEmail(data.email);
        if (existingEmailUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await storage.createUser({
        username: data.username,
        email: data.email && data.email.trim() !== "" ? data.email : null,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Create session
      req.session.userId = user.id;
      req.session.save(() => {
        const { password: _, ...userResponse } = user;
        res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = req.body as LoginInput;
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await verifyPassword(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.save(() => {
        const { password: _, ...userResponse } = user;
        res.json(userResponse);
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
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

      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update profile endpoint
  app.put('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }

      const updates = req.body;
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Upload avatar endpoint (placeholder for now)
  app.post('/api/auth/avatar', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No user session found" });
      }

      // For now, just return success - in a real app you'd handle file upload
      res.json({ message: "Avatar upload successful" });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });
}