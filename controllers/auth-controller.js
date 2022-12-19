import { validationResult } from 'express-validator';
import ApiError from '../exeptions/api-error.js';
import AuthService from '../services/auth-service.js';

class AuthController {
	async register(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
			}

			const { email, password } = req.body;

			const user = await AuthService.register(email, password);

			res.cookie('refresh_token', user.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}

	async login(req, res, next) {
		const { email, password } = req.body;

		try {
			const user = await AuthService.login(email, password);

			res.cookie('refresh_token', user.refreshToken, {
				httpOnly: true,
				sameSite: 'none',
			});

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}

	async getAccessToken(req, res, next) {
		try {
			const { refreshToken } = req.body;

			const user = await AuthService.getAccessToken(refreshToken);

			res.cookie('refresh_token', user.refreshToken, { httpOnly: true, sameSite: 'none' });

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}

	async logout(res, next) {
		try {
			res.clearCookie('refresh_token');
			return res.status(200).json({ message: 'Токен удален' });
		} catch (error) {
			next(error);
		}
	}
}

export default new AuthController();
