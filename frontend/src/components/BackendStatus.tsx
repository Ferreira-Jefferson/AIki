'use client';

import { useState, useEffect } from 'react';

export default function BackendStatus() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001');
        const data = await response.json();
        setMessage(data.message);
        setLoading(false);
      } catch (err) {
        setError('Erro ao conectar com o backend');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-white">Carregando...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-white">{message}</p>
      <div className="bg-green-500/20 p-4 rounded-lg">
        <p className="text-green-200">Backend conectado com sucesso!</p>
      </div>
    </div>
  );
} 