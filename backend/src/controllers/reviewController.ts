import { Request, Response } from 'express';
import { Card } from '../models/Card';

export const getCardsForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId } = req.params;
    const today = new Date();

    const cards = await Card.find({
      deck: deckId,
      nextReviewDate: { $lte: today }
    }).sort({ nextReviewDate: 1 }); 
	
    res.status(200).json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards para revisão:', error);
    res.status(500).json({ error: 'Erro ao buscar cards para revisão' });
  }
};
