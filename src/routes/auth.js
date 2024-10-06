import express from 'express';
import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  sendResetEmail,
  resetPassword,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  userRegisterSchema,
  userLoginSchema,
  userResetEmailSchema,
  userResetPasswordSchema,
} from '../schemas/userSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(userRegisterSchema),
  ctrlWrapper(registerUser),
);

router.post('/login', validateBody(userLoginSchema), ctrlWrapper(loginUser));

router.get('/protected-route', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'This is a protected route',
    user: req.user,
  });
});

router.post('/refresh', ctrlWrapper(refreshSession));

router.post('/logout', ctrlWrapper(logoutUser));

router.post(
  '/send-reset-email',
  validateBody(userResetEmailSchema),
  ctrlWrapper(sendResetEmail),
);

router.get('/reset-password', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'Token is valid, proceed to reset password.',
      email: decoded.email,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

router.post(
  '/reset-password',
  validateBody(userResetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
