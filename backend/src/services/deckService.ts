
import { Types } from 'mongoose';
import { IDeck, Deck, IGeneratedDeck} from '../models/Deck';
import { ICard, Card } from '../models/Card';
import { generateCardsWithAI } from './geminiService';

export const createDeckWithCards = async (deckData: IDeck): Promise<IDeck | void> => {
		const originalDescription: string = deckData.description;
		const data: IGeneratedDeck = await generateCardsWithAI(deckData);
		const cardsData: ICard[] = data.cards;
		deckData.description = originalDescription;

		try {
			const deck = await Deck.create(deckData) as IDeck & { _id: Types.ObjectId };
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

			deck.preferences = data.preferences;
			await deck.save();

		} catch (error: any) {
			throw new Error(`Error: ${error.message}`);
		}
};