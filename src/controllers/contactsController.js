import mongoose from 'mongoose';
import { findContactById, findAllContacts } from '../services/contacts.js';

export const getContactById = async (req, res) => {
  let { contactId } = req.params;
  contactId = contactId.trim();

  console.log(`Received request to get contact with ID: ${contactId}`);

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    console.log(`Invalid ID format: ${contactId}`);
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const contact = await findContactById(contactId);
    console.log(`Result from findContactById: ${contact}`);

    if (contact) {
      return res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    } else {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }
  } catch (error) {
    console.error('Error in getContactById controller:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await findAllContacts();
    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    console.error('Error in getContacts controller:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
