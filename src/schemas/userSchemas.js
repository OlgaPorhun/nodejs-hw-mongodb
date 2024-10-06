import Joi from 'joi';

export const userRegisterSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const userResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const userResetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});
