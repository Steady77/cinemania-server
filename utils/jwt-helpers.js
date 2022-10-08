import jwt from 'jsonwebtoken';

function jwtTokens(id) {
  const data = {
    id: id,
  };

  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
  };
}

export { jwtTokens };
