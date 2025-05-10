import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIki - Sistema de Memorização Inteligente",
  description: "Sistema de memorização baseado em IA inspirado no Anki",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600">
        {children}
      </body>
    </html>
  );
}