import mongoose from 'mongoose';
import {
  findContactById,
  findAllContacts,
  createNewContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContactById = async (req, res, next) => {
  let { contactId } = req.params;
  contactId = contactId.trim();

  console.log(`Received request to get contact with ID: ${contactId}`);

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    console.log(`Invalid ID format: ${contactId}`);
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const contact = await findContactById(contactId);
    console.log(`Result from findContactById: ${contact}`);

    if (!contact) {
      return next(createError(404, 'Contact not found'));
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    console.error('Error in getContactById controller:', error);
    return next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await findAllContacts();
    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    console.error('Error in getContacts controller:', error);
    return next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name || !phoneNumber || !contactType) {
    return next(createError(400, 'Missing required fields'));
  }

  try {
    const newContact = await createNewContact({
      name,
      phoneNumber,
      email,
      isFavourite: isFavourite || false,
      contactType,
    });

    return res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    console.error('Error in createContact controller:', error);
    return next(error);
  }
};

export const updateContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid ID format'));
  }

  if (!Object.keys(updateData).length) {
    return next(createError(400, 'No data provided for update'));
  }

  try {
    const updatedContact = await updateContact(contactId, updateData);

    if (!updatedContact) {
      return next(createError(404, 'Contact not found'));
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Error in updateContactById controller:', error);
    return next(error);
  }
};

export const deleteContactById = async (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const result = await deleteContact(contactId);

    if (!result) {
      return next(createError(404, 'Contact not found'));
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error in deleteContactById controller:', error);
    return next(error);
  }
};
