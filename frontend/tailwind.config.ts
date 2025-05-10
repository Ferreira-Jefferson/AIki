import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Adiciona configuração para evitar problemas de hidratação
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Desativa a geração de classes dinâmicas
  safelist: [
    'bg-blue-500',
    'bg-gray-500',
    'text-white',
    'text-red-400',
    'text-green-200',
    'bg-green-500/20',
    'bg-white/10',
    'backdrop-blur-lg',
    'rounded-lg',
    'p-8',
    'shadow-xl',
    'space-y-4',
    'p-4',
  ],
}; 