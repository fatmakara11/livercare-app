import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export type AuthedRequest = Parameters<RequestHandler>[0] & { userId?: number; username?: string };

export const authMiddleware: RequestHandler = (req, res, next) => {
  if (!JWT_SECRET) {
    res.status(500).json({ error: 'Server misconfigured: JWT_SECRET' });
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number; username: string };
    (req as AuthedRequest).userId = payload.sub;
    (req as AuthedRequest).username = payload.username;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
