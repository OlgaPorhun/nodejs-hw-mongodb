import fs from 'fs/promises';
import path from 'path';
import Contact from '../models/Contact.js';
import initMongoConnection from './initMongoConnection.js';

const importContacts = async () => {
  try {
    await initMongoConnection();

    const filePath = path.join(process.cwd(), 'contacts.json');

    const data = await fs.readFile(filePath, 'utf8');

    const contacts = JSON.parse(data);

    const result = await Contact.insertMany(contacts);
    console.log(`Successfully imported ${result.length} contacts to MongoDB.`);

    process.exit(0);
  } catch (error) {
    console.error('Error importing contacts:', error);
    process.exit(1);
  }
};

importContacts();
