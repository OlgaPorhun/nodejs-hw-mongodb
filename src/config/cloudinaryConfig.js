import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Використовуємо multer для збереження файлів у пам'ять
const storage = multer.memoryStorage();

const upload = multer({ storage });

export { cloudinary, upload };
