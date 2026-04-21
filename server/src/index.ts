import cors from 'cors';
import express from 'express';

import { pool } from './db.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  let db = false;
  try {
    await pool.query('SELECT 1');
    db = true;
  } catch {
    db = false;
  }
  res.json({ ok: true, db });
});

app.use('/auth', authRouter);
app.use('/me', meRouter);

const host = process.env.HOST ?? '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Vital Horizon API listening on http://localhost:${port} (bound ${host}, use your PC LAN IP from a phone)`);
});
