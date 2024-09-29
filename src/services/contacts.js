import Contact from '../models/Contact.js';
import createError from 'http-errors';

export const findAllContacts = async ({
  skip = 0,
  limit = 10,
  sortBy = 'name',
  sortOrder = 'asc',
} = {}) => {
  try {
    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    if (sortBy !== '_id') {
      sortOption._id = sortOrder === 'asc' ? 1 : -1;
    }

    const contacts = await Contact.find()
      .skip(skip)
      .limit(limit)
      .sort(sortOption)
      .collation({ locale: 'en', strength: 2 })
      .select('-__v');

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw createError(500, 'Error fetching contacts');
  }
};

export const findContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId).select('-__v');

    if (!contact) {
      throw createError(404, `Contact with ID ${contactId} not found`);
    }

    return contact;
  } catch (error) {
    console.error(`Error fetching contact with ID ${contactId}:`, error);

    if (error.status === 404) {
      throw error;
    }
    throw createError(500, 'Error fetching contact');
  }
};

export const createNewContact = async (contactData) => {
  try {
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    console.error('Error creating new contact:', error);
    throw createError(500, 'Error creating new contact');
  }
};

export const updateContact = async (contactId, updateData) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { $set: updateData },
      { new: true },
    ).select('-__v');

    if (!updatedContact) {
      throw createError(404, `Contact with ID ${contactId} not found`);
    }

    return updatedContact;
  } catch (error) {
    console.error(`Error updating contact with ID ${contactId}:`, error);
    if (error.status === 404) {
      throw error;
    }
    throw createError(500, 'Error updating contact');
  }
};

export const deleteContact = async (contactId) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      throw createError(404, `Contact with ID ${contactId} not found`);
    }

    return deletedContact;
  } catch (error) {
    console.error(`Error deleting contact with ID ${contactId}:`, error);
    if (error.status === 404) {
      throw error;
    }
    throw createError(500, 'Error deleting contact');
  }
};
