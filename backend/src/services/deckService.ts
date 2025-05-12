
import { IDeck, Deck } from '../models/Deck';
import { ICard, Card } from '../models/Card';
import { generateCardsWithAI } from './geminiService';

export const createDeckWithCards = async (deckData: IDeck): Promise<IDeck> => {
  
  const deck = await Deck.create(deckData);
  const cardsData: ICard[] = await generateCardsWithAI(deck);

  await Promise.all(cardsData.map(async (cardData) => {
    const card = await Card.create(cardData)
    return card;
  }));

  return deck;
};