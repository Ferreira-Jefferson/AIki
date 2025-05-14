import { ICard, Card } from '../models/Card';
import { IDeck, Deck } from '../models/Deck';
import { updateDifficultyCounts } from './reviewService';

// Função para criar um card
export const createCard = async (cardData: ICard): Promise<ICard> => {
  const card = await Card.create(cardData);
  return card;
};

export const processCardResponse = async (cardId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<{card: ICard, deck?: IDeck}> => {

	const validDifficulties = ['easy', 'medium', 'hard'];
	if (!validDifficulties.includes(difficulty)) {
	  throw new Error('Invalid difficulty level');
	}
  
	const card = await Card.findById(cardId).populate('deck');
	if (!card) {
	  throw new Error('Card not found');
	}
  
	const deck = await Deck.findById(card.deck);
	if (!deck) {
	  throw new Error('Deck not found');
	}
  
	if (card.difficulty === 'none') {
	  deck.cardsDifficulty[difficulty] += 1;
	} else {
	  deck.cardsDifficulty[card.difficulty] -= 1;
	  deck.cardsDifficulty[difficulty] += 1;
	}
  
	card.difficulty = difficulty;
	
	if (difficulty === 'easy') card.easyCount += 1;
	else if (difficulty === 'medium') card.mediumCount += 1;
	else if (difficulty === 'hard') card.hardCount += 1;
  
	switch (difficulty) {
	  case 'easy':
		card.nextReviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // +3 dias
		break;
	  case 'medium':
		card.nextReviewDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // +1 dia
		break;
	  case 'hard':
		const randomMinutes = Math.floor(Math.random() * 21) + 5; // 5-25 min
		card.nextReviewDate = new Date(Date.now()  + randomMinutes * 60 * 1000);
		break;
	}

	await Promise.all([
	  card.save(),
	  deck.save()
	]);

	return { card, deck };
  };
