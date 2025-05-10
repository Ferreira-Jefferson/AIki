import express from 'express';
import { createDeck, getAllDecks, getDeckById } from '../controllers/deckController';

const router = express.Router();

router.post('/', createDeck);
router.get('/', getAllDecks);
router.get('/:id', getDeckById);

export default router; 