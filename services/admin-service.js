import pool from '../db.js';

class AdminService {
	async getAllUsers(keyword) {
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

		return users.rows;
	}

	async deleteUser(id) {
		await pool.query('DELETE FROM favorites WHERE user_id = $1', [id]);
		await pool.query('DELETE FROM users WHERE id = $1', [id]);
	}
}

export default new AdminService();
