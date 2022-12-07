import express from 'express';
import pool from '../db.js';
import { genSalt, hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtTokens } from '../utils/jwt-helpers.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  body('email').isEmail().withMessage('Не корректная почта'),
  body('password').isLength({ min: 6, max: 32 }).withMessage('Пароль менее 6 символов'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }

      const { email, password } = req.body;
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (user.rows.length > 0) {
        return res.status(401).json({ message: 'Такой пользователь уже существует' });
      }

      const salt = await genSalt(10);
      const hachedPassword = await hash(password, salt);

      let newUser = await pool.query(
        'INSERT INTO users (email, password, created_at) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
        [email, hachedPassword],
      );

      const tokens = jwtTokens(newUser.rows[0].id);

      res.cookie('refresh_token', tokens.refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(200).json({
        user: {
          id: newUser.rows[0].id,
          email: newUser.rows[0].email,
          isAdmin: newUser.rows[0].is_admin,
          avatar: newUser.rows[0].avatar,
        },
        ...tokens,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь с такой почтой не найден' });
    }

    const isValidPassword = await compare(password, user.rows[0].password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const tokens = jwtTokens(user.rows[0].id);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });

    return res.status(200).json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        isAdmin: user.rows[0].is_admin,
        avatar: user.rows[0].avatar,
      },
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login/access-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: 'Пожалуйста авторизуйтесь' });

    const userData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!userData) return res.status(403).json({ message: error.message });

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userData.id]);

    let tokens = jwtTokens(userData.id);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'none' });

    return res.status(200).json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        isAdmin: user.rows[0].is_admin,
        avatar: user.rows[0].avatar,
      },
      ...tokens,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get('/logout', async (res) => {
  try {
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Токен удален' });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

export default router;
