import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routes/contacts.js';

function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino());

  app.use('/contacts', contactsRouter);

  app.use((req, res, next) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Error starting server:', error);
  });
}

export default setupServer;
