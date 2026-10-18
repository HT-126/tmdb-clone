import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// GET /api/health -> 200 when the database answers, 503 when it does not.
router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

export default router;
