import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  sendResetEmail,
  resetPassword,
  validateResetToken,
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

router.get('/reset-pwd', ctrlWrapper(validateResetToken));

router.post(
  '/reset-pwd',
  validateBody(userResetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
