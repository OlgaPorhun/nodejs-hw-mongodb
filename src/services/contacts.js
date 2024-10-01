import Contact from '../models/Contact.js';
import createError from 'http-errors';

export const findAllContacts = async ({
  userId,
  skip = 0,
  limit = 10,
  sortBy = 'name',
  sortOrder = 'asc',
} = {}) => {
  try {
    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const contacts = await Contact.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort(sortOption);
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw createError(500, 'Error fetching contacts');
  }
};

export const findContactById = async (contactId, userId) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) {
      console.error('Contact not found', contactId);
      throw createError(404, 'Contact not found');
    }
    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw createError(500, 'Error fetching contact');
  }
};

export const createNewContact = async (contactData) => {
  try {
    console.log('Creating new contact with data:', contactData);
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    console.error('Error creating new contact:', error);
    throw createError(500, 'Error creating new contact');
  }
};

export const updateContact = async (contactId, updateData, userId) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      { $set: updateData },
      { new: true },
    );
    if (!updatedContact) {
      console.error(
        'Contact not found or you are not the owner',
        contactId,
        userId,
      );
      throw createError(404, 'Contact not found or you are not the owner');
    }
    return updatedContact;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw createError(500, 'Error updating contact');
  }
};

export const deleteContact = async (contactId, userId) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      userId,
    });
    if (!deletedContact) {
      console.error(
        'Contact not found or you are not the owner',
        contactId,
        userId,
      );
      throw createError(404, 'Contact not found or you are not the owner');
    }
    return deletedContact;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw createError(500, 'Error deleting contact');
  }
};
