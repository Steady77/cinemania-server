import express from 'express';
import pool from '../db.js';
import { genSalt, hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtTokens } from '../utils/jwt-helpers.js';
import { authorize } from '../middleware/authorize.js';
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
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

      if (user.rows.length > 0) {
        return res.status(401).json({ message: 'Такой пользователь уже существует' });
      }

      const salt = await genSalt(10);
      const hachedPassword = await hash(password, salt);

      let newUser = await pool.query(
        'INSERT INTO users (user_email, user_password) VALUES ($1, $2) RETURNING *',
        [email, hachedPassword],
      );

      const tokens = jwtTokens(newUser.rows[0].user_id);

      res.cookie('refresh_token', tokens.refreshToken, {
        // 30 * 24 * 60 * 60 * 1000
        maxAge: 900000,
        httpOnly: true,
      });

      return res.json({
        user: {
          id: newUser.rows[0].user_id,
          email: newUser.rows[0].user_email,
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
    const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь с такой почтой не найден' });
    }

    const isValidPassword = await compare(password, user.rows[0].user_password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const tokens = jwtTokens(user.rows[0].user_id);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
    });

    return res.json({
      user: {
        id: user.rows[0].user_id,
        email: user.rows[0].user_email,
      },
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/login/access_token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) return res.status(401).json({ error: 'Пожалуйста авторизуйтесь' });

    const userData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!userData) return res.status(403).json({ error: error.message });

    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [userData.id]);

    let tokens = jwtTokens(userData.id);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });

    return res.json({
      user: {
        id: user.rows[0].user_id,
        email: user.rows[0].user_email,
      },
      ...tokens,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete('/logout', async (req, res) => {
  try {
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'refresh token deleted' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/refresh_token', authorize, async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken === null) return res.status(401).json({ error: 'Null refresh token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
      if (error) return res.status(403).json({ error: error.message });

      let tokens = jwtTokens(user);
      // { httpOnly: true, sameSite: 'none', secure: true }
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
      res.json(tokens);
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete('/refresh_token', async (req, res) => {
  try {
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'refresh token deleted.' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
