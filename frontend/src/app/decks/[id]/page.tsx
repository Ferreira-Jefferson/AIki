import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import React from 'react';
import DeckHeader from '@/components/DeckHeader/DeckHeader';
import FlashcardViewer from '@/components/FlashcardViewer/FlashcardViewer';


interface Deck {
  _id: string;
  title: string;
  description: string;
  creationDate: Date;
  totalCards: number;
  easy: number;
  medium: number;
  hard: number;
  cards: []
}

interface Props {
	params: {
	  id: string;
	};
  }

const getDeckById = async (id: string): Promise<Deck | null> => {
	const res = await fetch(`http://localhost:3001/api/decks/${id}`);
	if (!res.ok) return null;
	const data = await res.json();
	return {
	  ...data,
	  creationDate: new Date(data.createdAt),
	};
  };

const DeckPage: React.FC<Props> = async ({ params }) => {
	const { id } = await params;
  const deck = await getDeckById(id);

  if (!deck) return notFound();

  const calculateProgress = () => {
    const total = deck.easy + deck.medium + deck.hard;
    const progress = (deck.easy + deck.medium * 0.5) / total;
    return Math.min(Math.max(progress * 100, 0), 100);
  };

  const progress = calculateProgress();
  return (
	<>
		<DeckHeader 
		id={id}
		title={deck.title}
		description={deck.description}
		/>

		<FlashcardViewer deck={deck}/>
	</>

  );
}

export default DeckPage;