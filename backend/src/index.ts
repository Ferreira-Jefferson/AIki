import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import deckRoutes from './routes/deckRoutes';
import cardRoutes from './routes/cardRoutes';
import reviewRoutes from './routes/reviewRoutes';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to AIki API' });
});

// API Routes
app.use('/api/decks', deckRoutes);
app.use('/api/decks', cardRoutes);
app.use('/api/decks', reviewRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiki')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app; 