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

export const getContactById = async (req, res, next) => {
  let { contactId } = req.params;
  contactId = contactId.trim();

  if (!Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const contact = await findContactById(contactId);
    if (!contact) {
      return next(createError(404, `Contact not found`));
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    return next(error);
  }
};

export const getContacts = async (req, res, next) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const filter = {};

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
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .select('-__v');

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
    return next(error);
  }
};

export const updateContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;

  if (!Types.ObjectId.isValid(contactId)) {
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
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteContactById = async (req, res, next) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const result = await deleteContact(contactId);

    if (!result) {
      return next(createError(404, 'Contact not found'));
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
