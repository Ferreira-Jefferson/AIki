
'use client';
import Link from 'next/link';
import { format } from 'date-fns';
import styles from './page.module.css';
import CreateDeckModal from './create-deck/CreateDeckModal'; 
import { useState } from 'react';

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

export default function Home() {
  
  const decks: Deck[] = [
    {
      id: '1',
      title: 'Inglês Médico',
      description: 'Termos médicos em inglês',
      creationDate: new Date(2024, 2, 15),
      totalCards: 3,
      easy: 3,
      medium: 0,
      hard: 0
    },
	{
		id: '1',
		title: 'Inglês Médico',
		description: 'Termos médicos em inglês',
		creationDate: new Date(2024, 2, 15),
		totalCards: 3,
		easy: 1,
		medium: 1,
		hard: 1
	  },
	  {
		id: '1',
		title: 'Inglês Médico',
		description: 'Termos médicos em inglês',
		creationDate: new Date(2024, 2, 15),
		totalCards: 3,
		easy: 0,
		medium: 0,
		hard: 3
	  }
  
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);


const calculateProgress = (deck: Deck) => {
	const total = deck.easy + deck.medium + deck.hard;
	const progress = (deck.easy + deck.medium * 0.5) / total;
	return Math.min(Math.max(progress * 100, 0), 100); 
  };
  
  const getProgressColor = (progress: number) => {
	const hue = progress * 1.2; 
	return `hsl(${hue * 100}, 70%, 45%)`; 
  };

  return (
    <div className={styles.container}>
      {decks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Você ainda não possui nenhum deck criado</p>
          <Link href="/create-deck" className={styles.createButton}>
            Criar Primeiro Deck
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1>Meus Decks</h1>
            <button className={styles.floatingButton} onClick={() => setIsModalOpen(true)}>
			+ Criar Novo Deck
			</button>
          </div>
		  {isModalOpen && (
			<div className={styles.modalOverlay}>
				<CreateDeckModal onClose={() => setIsModalOpen(false)} />
			</div>
			)}

          <div className={styles.grid}>
            {decks.map((deck) => (
              <div key={deck.id} className={styles.deckCard}>
                <div className={styles.cardHeader}>
                  <h2>{deck.title}</h2>
				  <div className={styles.progressBar}>
					<div
						className={`${styles.progressFill} ${
						styles[
							calculateProgress(deck) >= 80
							? 'progress80'
							: calculateProgress(deck) >= 60
							? 'progress60'
							: calculateProgress(deck) >= 40
							? 'progress40'
							: calculateProgress(deck) >= 20
							? 'progress20'
							: 'progress0'
						]
						}`}
						style={{
						width: `${calculateProgress(deck)}%`,
						}}
					></div>
					</div>
				</div>

                <p className={styles.description}>{deck.description}</p>

                <div className={styles.stats}>
				<div className={styles.statItem}>
					<span>🗓️ Criação</span>
					<span>{format(deck.creationDate, 'dd/MM/yyyy')}</span>
					</div>
					<div className={styles.statItem}>
					<span>🧠 Cards</span>
					<span>{deck.totalCards}</span>
					</div>
					<div className={styles.difficultyStats}>
						<div className={`${styles.difficultyItem} ${styles.hard}`}> 🔴 {deck.hard}</div>
						<div className={`${styles.difficultyItem} ${styles.medium}`}> 🟠 {deck.medium}</div>
						<div className={`${styles.difficultyItem} ${styles.easy}`}> 🟢 {deck.easy}</div>
					</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}