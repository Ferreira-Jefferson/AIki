// src/app/create-deck/page.tsx
'use client';

import { useState } from 'react';
import styles from './CreateDeckPage.module.css';

export default function CreateDeckPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
	  	e.preventDefault();
	  
	  	const api = 'http://localhost:3001/api';

		type DeckResponse = Response & { _id?: string };
	  	const deck = await fetch(`${api}/decks`, {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ title, description }),
		});

		const data = await deck.json();
		console.log('Deck criado:', data);
	};
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Criar Deck</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Título do Deck"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className={styles.textarea}
          placeholder="Seja claro e objetivo. Ex: Aprender inglês com músicas do Linkin Park (Faint e Numb)."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
		  required
        />
        <button className={styles.button} type="submit">
          Criar
        </button>
      </form>
    </div>
  );
}
