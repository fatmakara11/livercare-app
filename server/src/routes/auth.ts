import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { pool } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;

const credentialsSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(4).max(128),
});

function signToken(userId: number, username: string) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing');
  return jwt.sign({ sub: userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    return;
  }

  const { username, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash],
    );
    const row = result.rows[0] as { id: number; username: string };
    const token = signToken(row.id, row.username);
    res.status(201).json({ token, user: { id: row.id, username: row.username } });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    return;
  }

  const { username, password } = parsed.data;
  const result = await pool.query('SELECT id, username, password_hash FROM users WHERE username = $1', [
    username,
  ]);

  if (result.rowCount === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const row = result.rows[0] as { id: number; username: string; password_hash: string };
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken(row.id, row.username);
  res.json({ token, user: { id: row.id, username: row.username } });
});
