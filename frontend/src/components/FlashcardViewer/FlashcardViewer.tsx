'use client';
import { useEffect, useState } from 'react';
import styles from './FlashcardViewer.module.css';

interface Card {
	_id: string
	front: string;
	back: string;
}

interface Deck {
	_id: string;
	title: string;
	description: string;
	creationDate: Date;
	cardsDifficulty: {
		easy: number;
		medium: number;
		hard: number;
	}
	cards: []
  }

export default function FlashcardViewer({ deck }: { deck: Deck }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [lastIndex, setLastIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
	const fetchCards = async () => {
	  try {
		const response = await fetch(`http://localhost:3001/api/decks/${deck._id}/cards`);
		
		if (!response.ok) {
		  throw new Error('Falha ao carregar as cartas do deck');
		}
		
		const cardsData = await response.json();
		setCards(cardsData); 
		calculateProgress(deck);
		
	  } catch (error) {
		console.error('Erro ao buscar cartas:', error);
	  }
	};
  
	fetchCards();
  }, [deck]);
  

  const currentCard = cards[currentIndex];

  const handleFlip = () => setFlipped(!flipped);

  const handlePrevious = () => {
		setFlipped(false);
		setTimeout(() => {
			setCurrentIndex(prev => prev - 1);			
		}, 200);
  };

  const handleNext = () => {
	  setFlipped(false);
	  setTimeout(() => {
			setCurrentIndex(prev => prev + 1);		
		}, 200);	  
  };

  const handleAnswer = async (difficulty: 'easy' | 'medium' | 'hard') => {
	try {
	  if (!currentCard) return;
  
	  const response = await fetch(
		`http://localhost:3001/api/decks/${deck._id}/cards/${currentCard._id}/process-response`,
		{
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ difficulty }),
		}
	  );
  
	  if (!response.ok) {
		throw new Error('Failed to process card response');
	  }
  
	  const { card, deck: updatedDeck } = await response.json();
	  
	  calculateProgress(updatedDeck);
	  setLastIndex(prev => prev + 1);
	  handleNext();
	  
	} catch (error) {
	  console.error('Error processing card response:', error);
	}
  };

 	const calculateProgress = (deck: Deck) => {
		console.log("Dentro", deck)
		const total = deck.cardsDifficulty.easy + deck.cardsDifficulty.medium + deck.cardsDifficulty.hard;
		if (total == 0)
			setProgress(0);
		const progress = (deck.cardsDifficulty.easy + deck.cardsDifficulty.medium * 0.5) / deck.cards.length;
		const result = Math.min(Math.max(progress * 100, 0), 100);
		setProgress(result)
	  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Progresso: {progress}%</span>
      </div>

      <div className={styles.flashcardArea}>
      <button
		onClick={handlePrevious}
		className={`${styles.navButton} ${currentIndex <= 0 ? styles.disabled : ''}`}
		aria-label="Anterior"
		disabled={currentIndex <= 0}
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
          className={`${styles.navButton} ${(currentIndex >= lastIndex) ? styles.disabled : ''}`}
          aria-label="Próximo"
		  disabled={currentIndex >= lastIndex}
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