import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { userRegisterSchema, userLoginSchema } from '../schemas/userSchemas.js';
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

export default router;
