import { Router } from 'express';
import { z } from 'zod';

import { pool } from '../db.js';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { buildPlanDates, defaultTasksForDate, liverLevelFromScore, pointsForTask } from '../plan.js';

export const meRouter = Router();

meRouter.use(authMiddleware);

meRouter.get('/', async (req, res) => {
  const userId = (req as AuthedRequest).userId!;
  const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
  const surgeryResult = await pool.query('SELECT surgery_date FROM surgery WHERE user_id = $1', [userId]);
  const healthResult = await pool.query(
    'SELECT health_score, liver_level, updated_at FROM health_status WHERE user_id = $1',
    [userId],
  );

  res.json({
    user: userResult.rows[0] ?? null,
    surgeryDate: surgeryResult.rows[0]?.surgery_date ?? null,
    health: healthResult.rows[0] ?? null,
  });
});

meRouter.get('/tasks', async (req, res) => {
  const userId = (req as AuthedRequest).userId!;
  const result = await pool.query(
    `SELECT task_date::text AS date, title, completed, points
     FROM tasks WHERE user_id = $1
     ORDER BY task_date, title`,
    [userId],
  );
  res.json({ tasks: result.rows });
});

const surgerySchema = z.object({
  surgeryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

meRouter.put('/surgery-date', async (req, res) => {
  const userId = (req as AuthedRequest).userId!;
  const parsed = surgerySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid surgeryDate', details: parsed.error.flatten() });
    return;
  }

  const { surgeryDate } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO surgery (user_id, surgery_date)
       VALUES ($1, $2::date)
       ON CONFLICT (user_id) DO UPDATE SET surgery_date = EXCLUDED.surgery_date`,
      [userId, surgeryDate],
    );

    await client.query('DELETE FROM tasks WHERE user_id = $1', [userId]);

    const dates = buildPlanDates(surgeryDate);
    for (const dateKey of dates) {
      const tasks = defaultTasksForDate(dateKey);
      for (const task of tasks) {
        await client.query(
          `INSERT INTO tasks (user_id, task_date, title, completed, points)
           VALUES ($1, $2::date, $3, $4, $5)`,
          [userId, task.task_date, task.title, task.completed, task.points],
        );
      }
    }

    await client.query(
      `INSERT INTO health_status (user_id, health_score, liver_level)
       VALUES ($1, 0, 5)
       ON CONFLICT (user_id) DO UPDATE SET health_score = 0, liver_level = 5, updated_at = NOW()`,
      [userId],
    );

    await client.query('COMMIT');
    res.json({ ok: true, surgeryDate });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to save surgery date' });
  } finally {
    client.release();
  }
});

const syncSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tasks: z.array(
    z.object({
      title: z.string(),
      completed: z.boolean(),
    }),
  ),
});

meRouter.post('/tasks/sync', async (req, res) => {
  const userId = (req as AuthedRequest).userId!;
  const parsed = syncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    return;
  }

  const { date, tasks } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const task of tasks) {
      const points = pointsForTask(task.completed);
      await client.query(
        `UPDATE tasks SET completed = $1, points = $2
         WHERE user_id = $3 AND task_date = $4::date AND title = $5`,
        [task.completed, points, userId, date, task.title],
      );
    }

    const agg = await client.query(
      'SELECT COUNT(*)::int AS total, SUM(CASE WHEN completed THEN 1 ELSE 0 END)::int AS done FROM tasks WHERE user_id = $1',
      [userId],
    );

    const total = agg.rows[0]?.total ?? 0;
    const done = agg.rows[0]?.done ?? 0;
    const healthScore = total === 0 ? 0 : Math.round((done / total) * 100);
    const liverLevel = liverLevelFromScore(healthScore);

    await client.query(
      `INSERT INTO health_status (user_id, health_score, liver_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
       SET health_score = EXCLUDED.health_score,
           liver_level = EXCLUDED.liver_level,
           updated_at = NOW()`,
      [userId, healthScore, liverLevel],
    );

    await client.query('COMMIT');
    res.json({ healthScore, liverLevel });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to sync tasks' });
  } finally {
    client.release();
  }
});
