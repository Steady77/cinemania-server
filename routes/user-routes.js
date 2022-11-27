import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/profile', authorize, async (req, res) => {
  try {
    const { id } = req.user;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    res.json({
      id: user.rows[0].id,
      email: user.rows[0].email,
      isAdmin: user.rows[0].is_admin,
      avatar: user.rows[0].avatar,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
