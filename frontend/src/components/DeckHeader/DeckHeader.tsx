// components/DeckHeader.tsx
'use client';
import { useRouter } from 'next/navigation';
import styles from './DeckHeader.module.css';

interface DeckHeaderProps {
  title: string;
  description: string;
}

export default function DeckHeader({ 
  title, 
  description,
}: DeckHeaderProps) {
  const router = useRouter();

  const handleEdit = () => {
    console.log('Editar deck');
    // router.push('/edit') ou abrir modal, etc.
  };

  const handleDelete = () => {
    console.log('Excluir deck');
    // Confirmação, fetch, redirecionamento...
  };

  return (
<header className={styles.header}>
  <button 
    onClick={() => router.push('/')}
    className={styles.backButton}
    aria-label="Voltar para a lista de decks"
  >
    Lista de Decks
  </button>

  <div className={styles.headerContent}>
    <h1 className={styles.title}>{title}</h1>
  </div>

  <div className={styles.menu}>
 	<button 
	onClick={handleEdit}
	className={styles.editButton}
	aria-label="Editar deck"
	>
	Editar Deck
	</button>

	<button 
	onClick={handleDelete}
	className={styles.deleteButton}
	aria-label="Excluir deck"
	>
	Excluir Deck
	</button>
  </div>
</header>

  );
}
