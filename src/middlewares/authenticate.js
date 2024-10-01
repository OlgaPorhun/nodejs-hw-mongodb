import jwt from 'jsonwebtoken';
import createError from 'http-errors';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('Token not provided');
    return next(createError(401, 'Token not provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.error('Token expired:', err);
        return next(createError(401, 'Token has expired'));
      } else if (err.name === 'JsonWebTokenError') {
        console.error('Invalid token:', err);
        return next(createError(401, 'Invalid token'));
      } else {
        console.error('Token verification failed:', err);
        return next(createError(401, 'Token verification failed'));
      }
    }

    if (!decodedToken.id) {
      console.error('User ID is missing from token');
      return next(createError(401, 'User ID is missing from token'));
    }

    console.log('User extracted from token:', decodedToken);
    req.user = { _id: decodedToken.id };
    next();
  });
};
