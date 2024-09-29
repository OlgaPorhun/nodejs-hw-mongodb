import mongoose from 'mongoose';
import createError from 'http-errors';

export const isValidId = (req, _, next) => {
  const { contactId } = req.params;
  console.log(`Validating contactId: ${contactId}`);
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    console.log(`Invalid ID format: ${contactId}`);
    return next(createError(400, 'Invalid ID format'));
  }
  next();
};
