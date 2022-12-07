import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';
import { genSalt, hash } from 'bcrypt';

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

router.put('/profile', authorize, async (req, res) => {
  try {
    const { id } = req.user;
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const sameUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    const isUser = user.rows.length > 0;
    const isSameUser = sameUser.rows.length > 0;

    if (isSameUser && id !== sameUser.rows[0].id) {
      return res.status(401).json({ message: 'Почта с таким именем уже занята' });
    }

    if (isUser) {
      if (password) {
        const salt = await genSalt(10);
        const hachedPassword = await hash(password, salt);

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hachedPassword, id]);
      }

      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, id]);
    }

    res.status(200).json({ message: 'Профиль обновлен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/favorites', authorize, async (req, res) => {
  const { id } = req.user;

  try {
    const data = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [id]);
    const favoritesIds = data.rows.map((obj) => obj.film_id);

    res.status(200).json(favoritesIds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile/favorites', authorize, async (req, res) => {
  const { id } = req.user;
  const { filmId } = req.body;

  if (id && filmId) {
    try {
      const data = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [id]);
      const favoritesIds = data.rows.map((obj) => obj.film_id);

      if (!favoritesIds.includes(filmId)) {
        await pool.query('INSERT INTO favorites (film_id, user_id) VALUES ($1, $2)', [filmId, id]);
        res.status(200).json({ message: 'Фильм добавлен в избранное' });
      } else {
        await pool.query('DELETE FROM favorites WHERE film_id = $1', [filmId]);
        res.status(200).json({ message: 'Фильм удален из избранного' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ message: 'Нет данных или не авторизованы' });
  }
});

export default router;
