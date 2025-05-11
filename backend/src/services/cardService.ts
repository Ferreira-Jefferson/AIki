import { ICard, Card } from '../models/Card';
import { updateDifficultyCounts } from './reviewService';

// Função para criar um card
export const createCard = async (cardData: ICard): Promise<ICard> => {
  const card = await Card.create(cardData);
  return card;
};

export const processCardResponse = async (cardId: string, difficulty: string): Promise<ICard> => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error('Invalid difficulty level');
  }

  const card = await Card.findById(cardId);
  if (!card) {
    throw new Error('Card not found');
  }
  
  const updatedCard = updateDifficultyCounts(card, difficulty);
  await updatedCard.save();
  
  return updatedCard;
};
