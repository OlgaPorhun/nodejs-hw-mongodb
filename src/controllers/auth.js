import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
  register,
  login,
  refreshSessionService,
  logoutSessionService,
} from '../services/auth.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(409, 'Email in use');
    }

    const user = await register({ name, email, password });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await login(email);
    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, 'Invalid email or password');
    }

    await Session.findOneAndDelete({ userId: user._id });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: Date.now() + 15 * 60 * 1000,
      refreshTokenValidUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: { accessToken },
    });
  } catch (error) {
    console.log('Error during login:', error);
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken, sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
      throw createError(401, 'Refresh token or session ID not provided');
    }

    const { accessToken, newRefreshToken, newSessionId } =
      await refreshSessionService(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('sessionId', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken, sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
      throw createError(401, 'Refresh token or session ID not provided');
    }

    await logoutSessionService(sessionId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    const resetPasswordUrl = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>To reset your password, click the link below:</p><p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    console.error('Error during sending reset password email:', error);
    next(createError(500, 'Failed to send the email, please try again later.'));
  }
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw createError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      return next(createError(401, 'Token is expired or invalid.'));
    }
    console.error('Error resetting password:', error);
    next(createError(500, 'Failed to reset the password.'));
  }
};
