import createError from 'http-errors';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(createError(400, error.message));
    }
    next();
  };
};
