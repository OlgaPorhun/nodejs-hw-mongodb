import { Types } from 'mongoose';
import createError from 'http-errors';
import { cloudinary } from '../config/cloudinaryConfig.js';
import {
  findContactById,
  createNewContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
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
      return next(createError(404, 'Contact not found'));
    }

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

  try {
    let photoUrl = null;
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream((error, result) => {
              if (error) {
                console.error('Error uploading photo to Cloudinary:', error);
                return reject(new Error('Failed to upload photo'));
              } else {
                resolve(result);
              }
            })
            .end(req.file.buffer);
        });
        photoUrl = result.secure_url;
      } catch (uploadError) {
        return next(createError(500, 'Photo upload failed, please try again.'));
      }
    }

    const newContact = await createNewContact({
      name,
      phoneNumber,
      email,
      isFavourite: isFavourite || false,
      contactType,
      userId: req.user._id,
      photo: photoUrl,
    });

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

  try {
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream((error, result) => {
              if (error) {
                console.error('Error uploading photo to Cloudinary:', error);
                return reject(new Error('Failed to upload photo'));
              } else {
                resolve(result);
              }
            })
            .end(req.file.buffer);
        });
        updateData.photo = result.secure_url;
      } catch (uploadError) {
        return next(createError(500, 'Photo upload failed, please try again.'));
      }
    }

    const updatedContact = await updateContact(
      contactId,
      updateData,
      req.user._id,
    );
    if (!updatedContact) {
      return next(
        createError(404, 'Contact not found or you are not the owner'),
      );
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
    console.error('Invalid ID format for deletion', contactId);
    return next(createError(400, 'Invalid ID format'));
  }

  try {
    const result = await deleteContact(contactId, req.user._id);
    if (!result) {
      return next(
        createError(404, 'Contact not found or you are not the owner'),
      );
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
