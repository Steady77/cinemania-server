import jwt from 'jsonwebtoken';

function jwtTokens(user_id) {
  const data = {
    id: user_id,
  };

  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
  };
}

export { jwtTokens };
