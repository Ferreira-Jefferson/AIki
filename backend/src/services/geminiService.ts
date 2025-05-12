import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
import { ICard } from "src/models/Card";
import { IDeck } from "src/models/Deck";

dotenv.config();
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
	throw new Error('API key for Google GenAI is not defined in the environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

async function anwer(prompt: string) {
	const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
	const result = await model.generateContent(prompt);
	const response = await result.response;
	return response.text();;
  }


export const generateCardsWithAI = async (deck: IDeck): Promise<ICard[]> => {
	const prompt = `**Gerar cards de estudo para o AIki**

1. Contexto fornecido: 
[Nome do Deck]: ${deck.title}
[Descrição do usuário sobre o conteúdo desejado]: ${deck.description}

2. Regras essenciais:
- Gerar entre 50-500 palavras (default 50 se não especificado)
- Extrair palavras/frases:
  • De músicas/artistas: usar apenas palavras presentes nas letras
  • De livros/filmes: usar palavras do conteúdo original
  • Contextos específicos: palavras relacionadas ao tema (ex: hospital)
- Excluir nomes próprios
- Formato obrigatório:
  {
    front: "palavra (pronúncia em PT-BR)",
    back: "tradução(s)",
    difficulty: "easy",
    tags: ["Idioma", "categoria"]
  }

3. Passo a passo:
① Identificar informações básicas
	- idioma principal: (se não detectado → {error: "Um idioma deve ser informado"})
	- quantidade de palavras: (se maior que 500 palavras → {error: "A quantidade excede o escopo de geração [500]."})
② Analisar contexto (área temática/mídia solicitada)
③ Filtrar palavras-chave relevantes:
   - Para músicas: analisar letras do artista/gênero
   - Para livros: extrair do texto original
   - Para temas: listar termos técnicos/essenciais
④ Adicionar pronúncia fonética intuitiva (ex: through = "thruu")
⑤ Classificar tags por categoria gramatical/área

4. Exemplo de saída para "Inglês médico - termos hospitalares":
[
  {
    front: "stethoscope (sté-tos-koup)",
    back: "estetoscópio"
    difficulty: "easy",
    tags: ["Inglês", "Medicina"]
  },
  {
    front: "intravenous (in-trá-vi-nas)",
    back: "intravenoso",
    difficulty: "medium",
    tags: ["Inglês", "Medicina"]
  }
]`

	const response = await anwer(prompt);

	const json = JSON.parse(response.replace('```json', "").replace('```', ""))

	const cards: ICard[] = json.map((card: any) => {
		const cardData = {
			front: card.front,
			back: card.back,
			viewedCount: 0,
			nextReviewDate: new Date().toISOString(),
			difficulty: card.difficulty,
			tags: card.tags,
			deck: (deck as any)._id.toString(),
		  };
		  return cardData;
	})
	return cards;
};

