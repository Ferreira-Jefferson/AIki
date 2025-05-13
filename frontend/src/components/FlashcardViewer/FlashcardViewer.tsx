'use client';
import { useEffect, useState } from 'react';
import styles from './FlashcardViewer.module.css';

interface Card {
  front: string;
  back: string;
}

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

export default function FlashcardViewer({ deck }: { deck: Deck }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
	const fetchCards = async () => {
	  try {
		const response = await fetch(`http://localhost:3001/api/decks/${deck._id}/cards`);
		
		if (!response.ok) {
		  throw new Error('Falha ao carregar as cartas do deck');
		}
		
		const cardsData = await response.json();
		setCards(cardsData); 
		
	  } catch (error) {
		console.error('Erro ao buscar cartas:', error);
	  }
	};
  
	fetchCards();
  }, [deck]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => setFlipped(!flipped);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  };

  const handleAnswer = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log(`Resposta: ${difficulty} para card ${currentIndex}`);
    handleNext();
  };

  const progress = cards.length > 0 
    ? Math.round(((currentIndex + 1) / cards.length) * 100 )
	: 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Progresso: {progress}%</span>
      </div>

      <div className={styles.flashcardArea}>
        <button 
          onClick={handlePrevious} 
          className={styles.navButton} 
          aria-label="Anterior"
        >
          &lt;
        </button>

        <div 
          className={`${styles.card} ${flipped ? styles.flipped : ''}`} 
          onClick={handleFlip}
        >
          <div className={styles.cardInner}>
            <div className={styles.cardFront}>{currentCard?.front || 'Front'}</div>
            <div className={styles.cardBack}>{currentCard?.back || 'Back'}</div>
          </div>
        </div>

        <button 
          onClick={handleNext} 
          className={styles.navButton} 
          aria-label="Próximo"
        >
          &gt;
        </button>
      </div>

      <div className={styles.difficultyButtons}>
        <button onClick={() => handleAnswer('easy')} className={styles.easy}>Easy</button>
        <button onClick={() => handleAnswer('medium')} className={styles.medium}>Medium</button>
        <button onClick={() => handleAnswer('hard')} className={styles.hard}>Hard</button>
      </div>
    </div>
  );
}