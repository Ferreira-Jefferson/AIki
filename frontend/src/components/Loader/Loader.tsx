// components/Loader.tsx
'use client';

import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "Processando..." }: LoaderProps) {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.dualRing}></div>
      <p className={styles.loaderText}>{message}</p>
    </div>
  );
}