import { Types } from 'mongoose';
import {
  findContactById,
  findAllContacts,
  createNewContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createError from 'http-errors';
import Contact from '../models/Contact.js';

export const getContacts = async (req, res, next) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const filter = { userId: req.user._id };

  if (type && ['work', 'home', 'personal'].includes(type)) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const pageNumber = parseInt(page, 10);
  const limit = parseInt(perPage, 10);
  const skip = (pageNumber - 1) * limit;

  try {
    const totalItems = await Contact.countDocuments(filter);
    if (totalItems === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No contacts found!',
        data: {
          data: [],
          page: pageNumber,
          perPage: limit,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    }

    const contacts = await Contact.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

    const totalPages = Math.ceil(totalItems / limit);
    const hasPreviousPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: pageNumber,
        perPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return next(error);
  }
};

export const getContactById = async (req, res, next) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    console.error('Invalid ID format', contactId);
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const contact = await findContactById(contactId, req.user._id);
    if (!contact) {
      console.error(
        `Contact not found with id ${contactId} for user ${req.user._id}`,
      );
      return next(createError(404, `Contact not found`));
    }

    console.log('Contact found', contact);
    return res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact by ID:', error);
    return next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name || !phoneNumber || !contactType) {
    console.error('Missing required fields:', req.body);
    return next(createError(400, 'Missing required fields'));
  }

  if (!req.user || !req.user._id) {
    console.error('User ID is missing from the request');
    return next(createError(401, 'Authorization failed. User ID is missing.'));
  }

  try {
    console.log('Creating contact with data:', {
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      userId: req.user._id,
    });

    const newContact = await createNewContact({
      name,
      phoneNumber,
      email,
      isFavourite: isFavourite || false,
      contactType,
      userId: req.user._id,
    });

    console.log('Successfully created contact:', newContact);

    return res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    console.error('Error creating new contact:', error);
    return next(createError(500, 'Error creating new contact'));
  }
};

export const updateContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;

  if (!Types.ObjectId.isValid(contactId)) {
    console.error('Invalid ID format for update', contactId);
    return next(createError(400, 'Invalid ID format'));
  }

  if (!Object.keys(updateData).length) {
    console.error('No data provided for update', updateData);
    return next(createError(400, 'No data provided for update'));
  }

  try {
    console.log(
      'Updating contact with ID:',
      contactId,
      'and data:',
      updateData,
    );
    const updatedContact = await updateContact(
      contactId,
      updateData,
      req.user._id,
    );
    if (!updatedContact) {
      console.error(
        'Contact not found or not owned by user',
        contactId,
        req.user._id,
      );
      return next(
        createError(
          404,
          'Contact not found or you are not the owner of this contact',
        ),
      );
    }

    console.log('Successfully updated contact:', updatedContact);
    return res.status(200).json({
      status: 200,
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return next(error);
  }
};

export const deleteContactById = async (req, res, next) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    console.error('Invalid ID format for deletion', contactId);
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    console.log('Deleting contact with ID:', contactId);
    const result = await deleteContact(contactId, req.user._id);

    if (!result) {
      console.error(
        'Contact not found or not owned by user',
        contactId,
        req.user._id,
      );
      return next(
        createError(
          404,
          'Contact not found or you are not the owner of this contact',
        ),
      );
    }

    console.log('Successfully deleted contact:', result);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    return next(error);
  }
};
