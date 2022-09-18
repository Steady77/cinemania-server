import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authorize, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json({ users: users.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
