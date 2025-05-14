import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
import { IDeck, IGeneratedDeck } from "src/models/Deck";

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


  function extractJsonFromText(text: string): any {
	const match = text.match(/```json\n([\s\S]*?)\n```/);
	if (!match) throw new Error('Bloco JSON não encontrado');
	
	try {
		const validJson = JSON.parse(match[1].replace('```json', "").replace('```', ""));
		return validJson
	} catch (error: any) {
	  throw new Error('JSON inválido: ' + error.message);
	}
  }
export const generateCardsWithAI = async (deck: IDeck): Promise<IGeneratedDeck> => {
	const prompt: string = `**Objetivo**  
	Gerar flashcards para um deck (sem criar se não houver correlação).
	
	**Regra obrigatória**  
	- SEM explicações, SEM Markdown, SEM campos adicionais.  
	- O retorno SEMPRE deve ser um JSON válido e SOMENTE um JSON válido.
	
	**Input**  
	- Deck.title: ${deck.title}  
	- Deck.description: ${deck.description}  
	
	**Fluxo**
	
	1. **Validação**  
	   - Detectar idioma via ISO 639-1 → se idioma não reconhecido, retornar:  
		 { "error": "[LANG_NOT_FOUND] Idioma não reconhecido", "codes": ["LANG_NOT_FOUND"] }  
		 - *Exceção:* Idiomas ficcionais amplamente conhecidos com vocabulário próprio são válidos.  
	   - Contar palavras da descrição → se > 1000, retornar:  
		 { "error": "[MAX_LIMIT_EXCEEDED] Descrição muito longa", "codes": ["MAX_LIMIT_EXCEEDED"] }  
	   - Verificar especificidade → se muito abrangente ou genérico, retornar:  
		 { "error": "[BROAD_CONTEXT] Contexto muito amplo. Seja mais específico.", "codes": ["BROAD_CONTEXT"] }  
	   - Validar contexto → se não for relacionado a aprendizado ou impossível de dividir em cards, retornar:  
		 { "error": "[INVALID_CONTEXT] Contexto não suportado", "codes": ["INVALID_CONTEXT"] }
	
	2. **Geração dos cards**  
	   - Extrair termos-chaves reais (sem nomes próprios ou termos inventados).  
	   - Para mídia específica (filme, música, livro), usar apenas palavras do conteúdo mencionado.  
	   - Adicionar pronúncia fonética simples entre parênteses, clara e compreensível.  
		 - Em português por padrão, ou no idioma do usuário.  
		 - Sem caracteres incomuns.  
		 - Exemplo:
		   - the: dhâ  
		   - of: âv  
		   - to: tuu  
		   - and: énd  
	   - Tags (máx. 3): idioma + categoria gramatical ou área temática.  
	   - Gerar 5 frases curtas (até 5 palavras) que incluam a palavra estudada.  
	   - Incluir no retorno o objeto 'preferences' no seguinte padrão.
	   	preferences {
			language: string;
			difficulty: 'beginner' | 'intermediate' | 'advanced';
			topics: string[];
			source: 'user_input' | 'music' | 'movie' | 'book' ;
		}
	
	3. **Formato de saída**  
	   - Se válido, retornar um array JSON com a seguinte estrutura:
		 {
		   "preferences": {
			 "language": "inglês",
			 "difficulty": "beginner",
			 "topics": ['to-be', 'verbs'],
			 "source": "user_input"
		   },
		   "cards": [
			{
				"front": "palavra (pronúncia)",
				"back": "tradução",
				"tags": ["Idioma", "Categoria", ...],
				"phrases": ["frase 1", "frase 2", ..., "frase 5"]
			},
			...
			]
		 }
	
	   - Em caso de erro, retornar SOMENTE:
		 {
		   "error": "mensagem clara",
		   "codes": ["CÓDIGO_ERRO", …]
		 }
	
	**Regras extra**  
	- Se a descrição não tiver correlação direta com a criação de cards, retornar erro.  
	- Gerar entre 50–500 palavras (padrão: 50 se não especificado).  
	- NUNCA inventar conteúdo ou expandir o que foi solicitado.  
	- SEM explicações, SEM Markdown, SEM campos adicionais.
	`;	

	const response = await anwer(prompt);
	const cards = extractJsonFromText(response)
	if(cards.error){
		throw new Error(cards.error);
	}
	return cards;
};

