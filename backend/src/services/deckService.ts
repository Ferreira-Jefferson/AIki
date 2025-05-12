
import { Types } from 'mongoose';
import { IDeck, Deck } from '../models/Deck';
import { ICard, Card } from '../models/Card';
import { generateCardsWithAI } from './geminiService';

export const createDeckWithCards = async (deckData: IDeck): Promise<IDeck> => {
  
  const deck = await Deck.create(deckData) as IDeck & { _id: Types.ObjectId };
  const cardsData: ICard[] = await generateCardsWithAI(deck);

  const cards = await Promise.all(cardsData.map(async (cardData) => {
	try {
	  const card = await Card.create({
		...cardData,
		deck: deck._id, 
	  });
	  return card;
	} catch (error) {
	  console.error('Error creating card:', error);
	}
  }));

  for(let card of cards)
  	deck.cards.push((card as any)._id);

  await deck.save();

  return deck;
};