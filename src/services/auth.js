import bcrypt from 'bcrypt';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

export const login = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const refreshSessionService = async (refreshToken) => {
  try {
    const existingSession = await Session.findOne({ refreshToken });

    if (!existingSession) {
      throw createError(403, 'Invalid refresh token');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    await Session.findOneAndDelete({ refreshToken });

    const user = await User.findById(decoded.id);
    if (!user) {
      throw createError(404, 'User not found');
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const newSession = await Session.create({
      userId: user._id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: Date.now() + 15 * 60 * 1000,
      refreshTokenValidUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: newAccessToken,
      newRefreshToken,
      newSessionId: newSession._id,
    };
  } catch (error) {
    throw createError(403, 'Invalid or expired refresh token');
  }
};

export const logoutSessionService = async (sessionId) => {
  const session = await Session.findByIdAndDelete(sessionId);
  if (!session) {
    throw createError(404, 'Session not found');
  }
};
