// components/SubmitButton.tsx
'use client';

import styles from './SubmitButton.module.css';

interface SubmitButtonProps {
  isLoading: boolean;
  label?: string;
  loadingLabel?: string;
}

export default function SubmitButton({ 
  isLoading, 
  label = "Criar", 
  loadingLabel = "Criando..." 
}: SubmitButtonProps) {
  return (
    <button 
      className={styles.button} 
      type="submit" 
      disabled={isLoading}
    >
      {isLoading ? (
        <span className={styles.loadingText}>{loadingLabel}</span>
      ) : (
        label
      )}
    </button>
  );
}