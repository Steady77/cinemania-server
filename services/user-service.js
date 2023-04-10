import pool from '../db.js';
import { genSalt, hash } from 'bcrypt';
import ApiError from '../exeptions/api-error.js';

class UserController {
	async getProfile(id) {
		const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

		if (user.rows.length === 0) {
			throw ApiError.BadRequest('Пользователь не найден');
		}

		return {
			id: user.rows[0].id,
			email: user.rows[0].email,
			isAdmin: user.rows[0].is_admin,
			avatar: user.rows[0].avatar,
		};
	}

	async updateProfile(id, email, password) {
		const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
		const sameUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		const isUser = user.rows.length > 0;
		const isSameUser = sameUser.rows.length > 0;

		if (isSameUser && id !== sameUser.rows[0].id) {
			throw ApiError.BadRequest('Почта с таким именем уже занята');
		}

		if (isUser) {
			if (password) {
				const salt = await genSalt(10);
				const hachedPassword = await hash(password, salt);

				await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hachedPassword, id]);
			}

			await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, id]);
		} else {
			throw ApiError.UnauthorizedError();
		}
	}

	async deleteProfile(id) {
		await pool.query('DELETE FROM favorites WHERE user_id = $1', [id]);
		await pool.query('DELETE FROM users WHERE id = $1', [id]);
	}

	async getFavorites(id) {
		const data = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [id]);
		const favoritesIds = data.rows.map((obj) => obj.film_id);

		return favoritesIds;
	}

	async toggleFavorites(id, filmId) {
		if (id && filmId) {
			const data = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [id]);
			const favoritesIds = data.rows.map((obj) => obj.film_id);

			if (!favoritesIds.includes(filmId)) {
				await pool.query('INSERT INTO favorites (film_id, user_id) VALUES ($1, $2)', [filmId, id]);
			} else {
				await pool.query('DELETE FROM favorites WHERE film_id = $1', [filmId]);
			}
		} else {
			throw ApiError.UnauthorizedError();
		}
	}
}

export default new UserController();
