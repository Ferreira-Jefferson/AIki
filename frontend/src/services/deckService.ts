export interface Deck {
	_id: string;
	title: string;
	description: string;
	createdAt: Date;
	cards: {
	  total: number;
	  easy: number;
	  medium: number;
	  hard: number;
	}
  }
  
  export const fetchDecks = async (): Promise<Deck[]> => {
	try {
	  const response = await fetch('http://localhost:3001/api/decks');
	  if (!response.ok) {
		throw new Error('Erro ao buscar decks');
	  }
	  const data = await response.json();
	  const decks: Deck[] = data.map((deck: any) => {
		return {
			_id: deck._id,
			title: deck.title,
			description: deck.description,
			createdAt: deck.createdAt,
			cards: {
			total: deck.cards.length,
			easy: 0,
			medium: 0,
			hard: 0,
			}
		}
	  });
	  return decks;
	} catch (error) {
	  console.error('Erro ao buscar decks:', error);
	  throw error;
	}
  };