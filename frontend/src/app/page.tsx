import BackendStatus from '@/components/BackendStatus';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          AIki - Sistema de Memorização Inteligente
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">Status do Backend</h2>
          <BackendStatus />
        </div>
      </div>
    </main>
  );
}
