'use client';
import { useEffect, useState } from 'react';
import styles from './FlashcardViewer.module.css';

interface IExamplesCard {
	front: string;
	back: string;
}

interface Card {
	_id: string
	front: string;
	back: string;
	examples: IExamplesCard[];
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showExampleBack, setShowExampleBack] = useState(false);
  const [randomIndexExample, setRandomIndexExample] = useState(0);
  const [count, setCount] = useState(0);
  

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

  const currentCard = cards[currentIndex];

  useEffect(() => {
	fetchCards();
  }, [deck]);

  useEffect(() => {
	setShowExample(false);
  }, [currentCard]);
  
  const handleFlip = () => setFlipped(!flipped);

  const handlePrevious = () => {
		if (isProcessing) return; 
  
		setIsProcessing(true);
		if(currentIndex > 0) {
			setFlipped(false);
			setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
		}
		setTimeout(() => setIsProcessing(false), 200);	
  };

  const handleNext = () => {
	if (isProcessing) return; 
  
	setIsProcessing(true);
	setFlipped(false);

	if (currentIndex == cards.length-1) {
		setCurrentIndex(0);
		setCount(0);
		setLastIndex(0);
		setCurrentIndex(prev => prev - 1);
	}

	setTimeout(() => setCurrentIndex(prev => prev + 1), 200);	
	setTimeout(() => setIsProcessing(false), 200);	
  };

  const handleShowExample = () => {
	const randomIndex = Math.floor(Math.random() * currentCard.examples.length);
	setRandomIndexExample(randomIndex)
	setShowExample(true);
	setShowExampleBack(false); 
}

  const handleAnswer = async (e: React.MouseEvent<HTMLButtonElement>, difficulty: 'easy' | 'medium' | 'hard') => {
	if (!currentCard) return;

	if (isProcessing) return;  
	setIsProcessing(true);

	const button = e.currentTarget;
     button.disabled = true;

	try {
  
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
  
	  const { deck: updatedDeck } = await response.json();
	  
	  
	  if(currentIndex > 9)
		{
			fetchCards()
			setFlipped(false);
			setTimeout(() => {
				setLastIndex(0)
				setCurrentIndex(0)
			}, 200);
		} else {
			setTimeout(() => handleNext(), 200);
			setLastIndex(prev => prev + 1)
		}
		if(count == cards.length-1)
			setCount(0);
		setCount(prev => prev + 1)
		calculateProgress(updatedDeck);
	  
	} catch (error) {
		console.error('Error processing card response:', error);
		setTimeout(() => setIsProcessing(false), 1000);	
	}	finally {
		setTimeout(() => {
			setIsProcessing(false)
			button.disabled = false;
		}, 500);
	}
  };

 	const calculateProgress = (deck: Deck) => {
		const total = deck.cardsDifficulty.easy + deck.cardsDifficulty.medium + deck.cardsDifficulty.hard;
		if (total == 0)
			setProgress(0);
		const progress = (deck.cardsDifficulty.easy + deck.cardsDifficulty.medium * 0.5) / deck.cards.length;
		const result = Math.round(Math.min(Math.max(progress * 100, 0), 100));
		setProgress(result)
	  };

  return (
    <div className={styles.container}>
		<div className={styles.header}>
        	<span>Progresso: {progress}%</span>
    	</div>
		<div className={styles.header_count}>
        	<span>{count}/{cards.length}</span>
     	</div>

	  <div className={styles.flashcardArea}>
  <button
    onClick={handlePrevious}
    className={`${styles.navButton} ${currentIndex <= 0 ? styles.disabled : ''}`}
    aria-label="Anterior"
    disabled={currentIndex <= 0 || isProcessing}
  >
    &lt;
  </button>

  <div className={styles.cardWithExample}>
    <div 
      className={`${styles.card} ${flipped ? styles.flipped : ''}`} 
      onClick={handleFlip}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>{currentCard?.front || 'Front'}</div>
        <div className={styles.cardBack}>{currentCard?.back || 'Back'}</div>
      </div>
    </div>

	{!showExample ? (
	<p 
		className={styles.exampleToggle} 
		onClick={handleShowExample}
	>
		Uso numa frase
	</p>
	) : (
	<p 
		className={styles.exampleText}
		onClick={() => setShowExampleBack(prev => !prev)}
		style={{ cursor: 'pointer' }}
	>
		{currentCard?.examples?.length
		? (showExampleBack 			
			? currentCard.examples[randomIndexExample].back 
			: currentCard.examples[randomIndexExample].front)
		: '🤔 Sem exemplo'}
	</p>
	)}

  </div>

  <button 
    onClick={handleNext} 
    className={`${styles.navButton} ${(currentIndex >= lastIndex) ? styles.disabled : ''}`}
    aria-label="Próximo"
    disabled={currentIndex >= lastIndex || isProcessing}
  >
    &gt;
  </button>
</div>

      <div className={styles.difficultyButtons}>
        <button onClick={(e) => handleAnswer(e, 'easy')} className={styles.easy} disabled={isProcessing}>Easy</button>
        <button onClick={(e) => handleAnswer(e, 'medium')} className={styles.medium}>Medium</button>
        <button onClick={(e) => handleAnswer(e, 'hard')} className={styles.hard}>Hard</button>
      </div>
    </div>
  );
}
