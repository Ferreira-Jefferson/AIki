// components/DeckHeader.tsx
'use client';
import { useRouter } from 'next/navigation';
import styles from './DeckHeader.module.css';

interface DeckHeaderProps {
	id: string;
  	title: string;
  	description: string;
}

export default function DeckHeader({ 
	id,
  	title, 
  	description,
}: DeckHeaderProps) {
  const router = useRouter();

  const handleEdit = () => {
    console.log('Editar deck');
    // router.push('/edit') ou abrir modal, etc.
  };

  const handleDelete = async () => {
	try {
	  console.log('Excluindo deck...', id);
	  
	  const res = await fetch(`http://localhost:3001/api/decks/${id}`, {
		method: 'DELETE',
	  });
  
	  if (!res.ok) {
		throw new Error('Falha ao excluir o deck');
	  }
  
	  console.log('Deck excluído com sucesso');
	  router.push('/');
	  
	} catch (error) {
	  console.error('Erro ao excluir deck:', error);
	}
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
