import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authorize, async (req, res) => {
  try {
    const { keyword } = req.query;
    let users;

    if (keyword) {
      users = await pool.query(
        'SELECT id, email, created_at, is_admin FROM users WHERE email LIKE $1',
        ['%' + keyword + '%'],
      );
    }

    if (!keyword) {
      users = await pool.query('SELECT id, email, created_at, is_admin FROM users');
    }

    res.json({
      users: users.rows.map((user) => ({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
