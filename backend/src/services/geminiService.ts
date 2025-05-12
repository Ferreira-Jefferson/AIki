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
	return response.text();
  }


export const generateCardsWithAI = async (deck: IDeck): Promise<ICard[]> => {
	const prompt: string = `**Objetivo** Gerar flashcards para um deck (sem criar se não houver correlação).

**Regra obrigatória**
- SEM explicações, SEM Markdown, SEM campos adicionais.  
- O retorno SEMPRE deve ser um json válido e somente um json válido. 

**Input**  
- Deck.title: ${deck.title}
- Deck.description: ${deck.description}

**Fluxo**  
1. **Validação**  
   - Detectar idioma via ISO 639-1 → se falhar, abortar com  
     { "error": "[LANG_NOT_FOUND] Idioma não reconhecido", "codes": ["LANG_NOT_FOUND"] }  
   - Contar palavras da descrição → se > 500, abortar com  
     { "error": "[MAX_LIMIT_EXCEEDED] Descrição muito longa", "codes": ["MAX_LIMIT_EXCEEDED"] }  
   - Verificar contexto válido (Se não for relacionado a aprender algo e que dê para dividir em cards é inválido) → se inválido, abortar com  
     { "error": "[INVALID_CONTEXT] Contexto não suportado", "codes": ["INVALID_CONTEXT"] }
   - Verificar especificidade (Se estiver muito abrangente e difícil de categorizar é inválido) → se inválido, abortar com  
     { "error": "[BROAD_CONTEXT] Contexto muito amplo. Seja mais específico.", "codes": ["BROAD_CONTEXT"] }

2. **Geração dos cards**  
   - Extrair termos-chaves reais (sem inventar nomes, nem usar nomes próprios).  
   - Para mídia específica: usar apenas palavras do texto/álbum/filme mencionado.  
   - Incluir pronúncia fonética simples entre parênteses. 
   		- Português por padrão, ou na lingua solicitada pelo usuário. 
		- A pronuncia fonética deve ser clara e compreeensível
		- Não deve ter caracteres incomuns
		- Não deve inventar caracteres
		- Exemplo:
			- the: dhâ
			- of: âv
			- to: tuu
			- and: énd
   - Definir dificuldade (easy|medium|hard) conforme uso e complexidade.  
   - Tags (máx. 3): idioma + categoria gramatical ou área temática.

3. **Formato de saída**  
   - Se OK, retornar **apenas** um array JSON de objetos:
     [
       {
         "front": "palavra (pronúncia)",
         "back": "tradução",
         "difficulty": "easy|medium|hard",
         "tags": ["Idioma", "Categoria", ...]
       }
     ]
     
   - Caso de erro, retornar **apenas**:
     {
       "error": "mensagem clara",
       "codes": ["CÓDIGO_ERRO", …]
     }
4. **Exemplo de saída com todo ok**
[
	{
		"front": "other (âdhâr)",
		"back": "âdhâr",
		"difficulty": "medium",
		"tags": ["Inglês", "Adjetivo", "Pronome"]
	}
]

**Regras extra**  
- Se a dercrição não tiver correlação direta com a criação de de cards, aborte.
- 50–500 palavras geradas (default: 50, se não especificado).
- NUNCA inventar ou expandir conteúdo além do formato.  
- SEM explicações, SEM Markdown, SEM campos adicionais.  
`;

	const response = await anwer(prompt);
	console.log(response)

	const json = JSON.parse(response.replace('```json', "").replace('```', ""))

	if(json.error){
		throw new Error(json.error);
	}
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

