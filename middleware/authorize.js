import jwt from 'jsonwebtoken';

function authorize(req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) return res.status(401).json({ message: 'Пожалуйста авторизуйтесь' });

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.status(403).json({ message: error.message });
    req.user = user;
    next();
  });
}

export { authorize };
