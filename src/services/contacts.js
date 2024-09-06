import Contact from '../models/Contact.js';

export const findContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw new Error('Error fetching contact');
  }
};

export const findAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Error fetching contacts');
  }
};
