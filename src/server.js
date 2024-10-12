import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import contactsRouter from './routes/contacts.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { authenticateToken } from './middlewares/authenticateToken.js';
import swaggerDocument from '../docs/swagger.json' assert { type: 'json' };

function setupServer() {
  const app = express();

  app.use(express.json());

  app.use(cookieParser());

  app.use(
    cors({
      origin: [
        'https://nodejs-hw-mongodb-i55t.onrender.com',
        'http://localhost:3000',
      ],
      credentials: true,
    }),
  );

  app.set('trust proxy', 1);

  app.use(pino());

  app.get('/', (_, res) => {
    res.send('API is running');
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  app.get('/protected-route', authenticateToken, (req, res) => {
    res.status(200).json({
      message: 'This is a protected route',
      user: req.user,
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Error starting server:', error);
  });
}

export default setupServer;
