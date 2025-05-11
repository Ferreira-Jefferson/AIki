import express from 'express';
import { createDeck, getAllDecks, getDeckById, updateDeck, deleteDeck } from '../controllers/deckController';

const router = express.Router();

router.post('/', createDeck);
router.get('/', getAllDecks);
router.get('/:id', getDeckById);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);


export default router; 