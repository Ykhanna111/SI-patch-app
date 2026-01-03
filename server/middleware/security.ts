import type { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'crypto';

const GUEST_DAILY_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AUTHENTICATED_RATE_LIMIT = 100;
const GUEST_RATE_LIMIT = 30;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function securityHeaders(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
    
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.cspNonce = nonce;
    
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    next();
  };
}

export function generateCsrfToken(req: Request): string {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

export function csrfProtection(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

export function csrfTokenEndpoint(): RequestHandler {
  return (req: Request, res: Response) => {
    res.json({ csrfToken: 'disabled' });
  };
}

function getRateLimitKey(req: Request): string {
  const userId = req.session?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

setInterval(cleanupRateLimitStore, 60000);

export function rateLimit(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    
    const key = getRateLimitKey(req);
    const isAuthenticated = !!req.session?.userId;
    const limit = isAuthenticated ? AUTHENTICATED_RATE_LIMIT : GUEST_RATE_LIMIT;
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }
    
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    
    if (entry.count > limit) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

const guestLimitStore = new Map<string, { count: number; date: string }>();

export function getGuestDailyLimit(): number {
  return GUEST_DAILY_LIMIT;
}

export function checkGuestLimit(req: Request): { allowed: boolean; remaining: number; message?: string } {
  if (req.session?.userId) {
    return { allowed: true, remaining: -1 };
  }
  
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const today = new Date().toDateString();
  
  let entry = guestLimitStore.get(ip);
  
  if (!entry || entry.date !== today) {
    entry = { count: 0, date: today };
    guestLimitStore.set(ip, entry);
  }
  
  const remaining = Math.max(0, GUEST_DAILY_LIMIT - entry.count);
  
  if (entry.count >= GUEST_DAILY_LIMIT) {
    return { 
      allowed: false, 
      remaining: 0,
      message: `Daily limit reached. Sign up for unlimited puzzles!`
    };
  }
  
  return { allowed: true, remaining };
}

export function incrementGuestGames(req: Request): void {
  if (!req.session?.userId) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const today = new Date().toDateString();
    
    let entry = guestLimitStore.get(ip);
    
    if (!entry || entry.date !== today) {
      entry = { count: 1, date: today };
    } else {
      entry.count++;
    }
    
    guestLimitStore.set(ip, entry);
  }
}

export function isUserAuthenticated(req: Request): boolean {
  return !!req.session?.userId;
}

export function sanitizeGameForClient(game: any, isAuthenticated: boolean): any {
  const sanitized = {
    id: game.id,
    gameMode: game.gameMode,
    gridSize: game.gridSize,
    difficulty: game.difficulty,
    puzzle: game.puzzle,
    currentState: game.currentState,
    constraints: game.constraints,
    timeElapsed: game.timeElapsed,
    mistakes: game.mistakes,
    hintsUsed: game.hintsUsed,
    isCompleted: game.isCompleted,
    moves: game.moves,
    completedAt: game.completedAt,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
  
  if (isAuthenticated) {
    (sanitized as any).userId = game.userId;
  }
  
  return sanitized;
}

setInterval(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  const keysToDelete: string[] = [];
  guestLimitStore.forEach((value, key) => {
    if (value.date === yesterdayStr || value.date < yesterdayStr) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => guestLimitStore.delete(key));
}, 3600000);
