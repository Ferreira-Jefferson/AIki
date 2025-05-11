// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "AIki",
  description: "Sistema de memorização baseado em IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
     	<body>{children}</body>
    </html>
  );
}
