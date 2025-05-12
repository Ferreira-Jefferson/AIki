// src/app/deck/[id]/page.tsx
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

interface Deck {
  id: string;
  title: string;
  description: string;
  creationDate: Date;
  totalCards: number;
  easy: number;
  medium: number;
  hard: number;
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

export default async function DeckPage({ params }: { params: { id: string } }) {
  const deck = await getDeckById(params.id);

  if (!deck) return notFound();

  const calculateProgress = () => {
    const total = deck.easy + deck.medium + deck.hard;
    const progress = (deck.easy + deck.medium * 0.5) / total;
    return Math.min(Math.max(progress * 100, 0), 100);
  };

  const progress = calculateProgress();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{deck.title}</h1>
      <p><strong>Descrição:</strong> {deck.description}</p>
      <p><strong>Criado em:</strong> {format(deck.creationDate, 'dd/MM/yyyy')}</p>
      <p><strong>Total de cards:</strong> {deck.totalCards}</p>

      <h2>Progresso: {Math.round(progress)}%</h2>

      <ul>
        <li>🟢 Fáceis: {deck.easy}</li>
        <li>🟠 Médios: {deck.medium}</li>
        <li>🔴 Difíceis: {deck.hard}</li>
      </ul>
    </main>
  );
}
