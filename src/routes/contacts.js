import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById,
} from '../controllers/contactsController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  contactCreateSchema,
  contactUpdateSchema,
} from '../schemas/contactSchemas.js';

const router = express.Router();

router.get('/', ctrlWrapper(getContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post('/', validateBody(contactCreateSchema), ctrlWrapper(createContact));
router.patch(
  '/:contactId',
  isValidId,
  validateBody(contactUpdateSchema),
  ctrlWrapper(updateContactById),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactById));

export default router;
