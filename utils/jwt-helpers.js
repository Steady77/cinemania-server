import jwt from 'jsonwebtoken';

export function jwtTokens(id) {
	const data = {
		id: id,
	};

	const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
	const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

	return {
		accessToken,
		refreshToken,
	};
}
