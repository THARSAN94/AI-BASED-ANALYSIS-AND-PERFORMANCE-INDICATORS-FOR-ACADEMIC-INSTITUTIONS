import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'academic_compliance_system_jwt_secret_2026_secure';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    collegeName: string;
    role: string;
  };
}

export function generateToken(user: UserDoc): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      collegeName: user.collegeName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword, collegeName } = req.body;

    if (!name || !email || !password || !collegeName) {
      return res.status(400).json({ error: 'All fields (full name, email, password, college name) are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const existing = db.users.findByEmail(emailNormalized);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = db.users.create({
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      collegeName: collegeName.trim(),
      role: 'institution_admin',
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Institution account registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        collegeName: user.collegeName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.users.findByEmail(emailNormalized);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        collegeName: user.collegeName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export function handleGetMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const user = db.users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      collegeName: user.collegeName,
      role: user.role,
    },
  });
}
