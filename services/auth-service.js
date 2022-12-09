import pool from '../db.js';
import { genSalt, hash, compare } from 'bcrypt';
import { jwtTokens } from '../utils/jwt-helpers.js';
import jwt from 'jsonwebtoken';
import ApiError from '../exeptions/api-error.js';

class AuthService {
  async register(email, password) {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      throw ApiError.BadRequest('Такой пользователь уже существует');
    }

    const salt = await genSalt(10);
    const hachedPassword = await hash(password, salt);

    let newUser = await pool.query(
      'INSERT INTO users (email, password, created_at) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [email, hachedPassword],
    );

    const tokens = jwtTokens(newUser.rows[0].id);

    return {
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        isAdmin: newUser.rows[0].is_admin,
        avatar: newUser.rows[0].avatar,
      },
      ...tokens,
    };
  }

  async login(email, password) {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      throw ApiError.BadRequest('Неверная почта или пароль');
    }

    const isValidPassword = await compare(password, user.rows[0].password);

    if (!isValidPassword) {
      throw ApiError.BadRequest('Неверная почта или пароль');
    }

    const tokens = jwtTokens(user.rows[0].id);

    return {
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        isAdmin: user.rows[0].is_admin,
        avatar: user.rows[0].avatar,
      },
      ...tokens,
    };
  }

  async getAccessToken(refreshToken) {
    if (!refreshToken) throw ApiError.UnauthorizedError();

    const userData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!userData) throw ApiError.UnauthorizedError();

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userData.id]);

    const tokens = jwtTokens(userData.id);

    return {
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        isAdmin: user.rows[0].is_admin,
        avatar: user.rows[0].avatar,
      },
      ...tokens,
    };
  }
}

export default new AuthService();
