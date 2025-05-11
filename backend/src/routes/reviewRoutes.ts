import express from 'express';
import { getCardsForReview } from '../controllers/reviewController';

const router = express.Router();

router.get('/:deckId/review', getCardsForReview);

export default router; 
