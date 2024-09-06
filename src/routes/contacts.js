import express from 'express';
import {
  getContacts,
  getContactById,
} from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getContacts);
router.get('/:contactId', getContactById);

export default router;
