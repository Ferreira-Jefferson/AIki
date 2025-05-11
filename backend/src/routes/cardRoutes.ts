import express from 'express';
import { createCard, getCards, getCard, updateCard, deleteCard, processCardResponse } from '../controllers/cardController';

const router = express.Router();

router.post('/:deckId/cards', createCard);
router.get('/:deckId/cards', getCards);
router.get('/:deckId/cards/:id', getCard);
router.put('/:deckId/cards/:id', updateCard);
router.delete('/:deckId/cards/:id', deleteCard);
router.post('/:deckId/cards/:id/process-response', processCardResponse);

export default router;
