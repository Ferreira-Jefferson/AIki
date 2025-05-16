'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  deck: {
    id: string;
    title: string;
    description: string;
    creationDate: Date;
	cards: {
		total: number;
		easy: number;
		medium: number;
		hard: number;
	  }
  };
}

export default function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter();
  
  const calculateProgress = () => {
    const total = deck.cards.easy + deck.cards.medium + deck.cards.hard;
	if (total == 0)return total;
    const progress = (deck.cards.easy + deck.cards.medium * 0.5) / deck.cards.total;
    return Math.round(Math.min(Math.max(progress * 100, 0), 100));
  };

  const handleClick = () => {
    router.push(`/decks/${deck.id}`);
  };

  const handleDescription = () => {
	const desc = deck.description.split('\n')
	return desc.length > 1 ? desc[0] + ' [...]' : desc[0];
  }

  const progress = calculateProgress();

  return (
    <div className={styles.deckCard} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <h2>{deck.title}</h2>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              backgroundColor: getProgressColor(progress / 100)
            }}
            data-progress={Math.round(progress)}
          ></div>
        </div>
      </div>

      <p className={styles.description}>{handleDescription()}</p>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span>🗓️ Criação</span>
          <span>{format(deck.creationDate, 'dd/MM/yyyy')}</span>
        </div>
        <div className={styles.statItem}>
          <span>🧠 Cards</span>
          <span>{deck.cards.total}</span>
        </div>
        <div className={styles.difficultyStats}>
          <span className={styles.easy}>🟢 {deck.cards.easy}</span>
          <span className={styles.medium}>🟠 {deck.cards.medium}</span>
          <span className={styles.hard}>🔴 {deck.cards.hard}</span>
        </div>
      </div>
    </div>
  );
}

function getProgressColor(progress: number) {
  if (progress >= 0.8) return '#228B22'; // Verde
  if (progress >= 0.6) return '#20B2AA'; // Azul esverdeado
  if (progress >= 0.4) return '#FFD700'; // Dourado
  if (progress >= 0.2) return '#FF6347'; // Tomato
  return '#FF0000'; // Vermelho
}
