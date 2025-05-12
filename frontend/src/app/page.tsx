'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Deck } from '@/services/deckService';
import { fetchDecks } from '@/services/deckService';
import CreateDeckModal from './create-deck/CreateDeckModal';
import DeckCard from '@/components/DeckCard/DeckCard';
import styles from './page.module.css';

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDecks = async () => {
      try {
        const data = await fetchDecks();
        setDecks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadDecks();
  }, []);

  const handleDeckCreated = async () => {
    try {
      const data = await fetchDecks();
      setDecks(data);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar decks');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Carregando seus decks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Erro: {error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {decks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Você ainda não possui nenhum deck criado</p>
          <button 
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            Criar Primeiro Deck
          </button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1>Meus Decks</h1>
            <button 
              className={styles.floatingButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Criar Novo Deck
            </button>
          </div>

          <div className={styles.grid}>
            {decks.map((deck) => (
              <DeckCard 
                key={deck._id}
                deck={{
                  id: deck._id,
                  title: deck.title,
                  description: deck.description,
                  creationDate: new Date(deck.createdAt),
                  totalCards: deck.cards.total,
                  easy: deck.cards.easy,
                  medium: deck.cards.medium,
                  hard: deck.cards.hard
                }}
              />
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <CreateDeckModal 
          onClose={() => setIsModalOpen(false)}
          onDeckCreated={handleDeckCreated}
        />
      )}
    </div>
  );
}