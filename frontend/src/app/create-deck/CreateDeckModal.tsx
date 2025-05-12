
'use client';

import { useState } from 'react';
import styles from './CreateDeckModal.module.css';

export default function CreateDeckModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const api = 'http://localhost:3001/api';
      await fetch(`${api}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay do loader - bloqueia toda a interface */}
      {isLoading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.dualRing}></div>
          <p className={styles.loaderText}>Criando seu deck...</p>
        </div>
      )}

      {/* Modal principal (desabilitado durante loading) */}
      <div 
        className={styles.modalOverlay} 
        onClick={onClose}
        style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.7 : 1 }}
      >
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose} disabled={isLoading}>
            ×
          </button>
          <h2 className={styles.title}>Criar Deck</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              placeholder="Título do Deck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
            <textarea
              className={styles.textarea}
			  placeholder="Seja claro e objetivo. Ex: Aprender 20 palavras em inglês que tenham nas músicas do Linkin Park (Faint e Numb)."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}