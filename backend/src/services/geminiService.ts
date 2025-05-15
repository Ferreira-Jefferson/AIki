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
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
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
	const prompt: string = `
	Crie um deck de flashcard com base na descrição, para isso siga a estritamente as regras abaixo.

	# Inputs.
	- Nome do deck: ${deck.title}  
	- Descrição do deck: ${deck.description} 


	# Regra obrigatória.
	- Se for passadas as palavras ou frases para criar o deck eles somente devem ser formatados para ficarem no padrão do json.
	- Respeite o que foi solicitado na descrição.  
	- SEM explicações, SEM Markdown, SEM campos adicionais.  
	- O retorno SEMPRE deve ser um JSON válido e SOMENTE um JSON válido.
	- Um card sem quantidade informada deve ter no mínimo 20 palavras/frases
	- 100 palavras é uma quantidade pequena e deve ser gerada sem problemas

	# Objetivo.
	* Com base na descrição do deck gere json de flashcards para um deck.
	* O deck pode ser apenas de palavras ou mesmo só com frases completas
		- Se for um deck de palavras, gere também COM a pronuncia fonética
		- Se for um deck de frases, a frase ndeve ter entre 3 e 7 palavras, SEM a pronuncia da frase
		- Se na descrição não estiver informando se é palavra ou frase, crie um deck de palavras e a pronuncia fonética
	* A quantidade de palavras solicitadas pelo cliente DEVE SER RESPEITADA
	* Não devem ter palavras ou frases repeditas nos cards.

	# Inferências.
	* Se na descrição estiver, por exemplo, o objetivo de aprender uma música, logo deve ser gerado um deck com TODAS as PALAVRAS da música, sem repetir as palavras.
	* Se na descrição estiver o objetivo de aprender com FRASES de uma música, você deve gerar um deck com TODAS as FRASES contidas na música informada.
	* Se for possível definir o idioma com base na descrição, não é necessário retornar um erro, por exemplo: aprender frases de um Dorama. → gerar um card em coreano.
	* Se o tema da descrição for muito amplo, CRIE um texto com ATÉ 50 palavras sobre o tema e divida  em palavras, ou frases se solicitado na descrição.
	* Se não for mídia (música, livro, filme, etc) e a não for informada a quantidade de cards/palavras/frases o mínimo a ser gerado são 20 palavras/frases.
	* Para mídias  (música, livro, filme, etc) a quantidade de cards/palavras/frases geradas deve ser o máximo possível ou a quantidade solicitada na descrição.
	* Se não for informado o idioma e não for possível inferir pela descrição os flashcards devem ser gerados na lingua da descrição.
		- Exemplos:
			- palavras das musica do Michael Jackson → Inglês
			- 10 frases do Naruto → Japonês
			- 20 palavras sobre medicina → Português (idioma da descrição)
	
	# Validação.
	   - Idioma: Se for informado um idioma, ele deve ser real, de acordo com ISO 639-1 → se idioma não reconhecido ou não for possível inferir, retornar:  
		 { "error": "[LANG_NOT_FOUND] Idioma não reconhecido", "codes": ["LANG_NOT_FOUND"] }  
		 - Exceção: Idiomas ficcionais amplamente conhecidos com vocabulário próprio são válidos.  

	   - Quantidade de cards: Se quantidade de palavras ou frase informada na descrição, siga a regra: palavras > 1000 ou frases > 100, retornar:
		 { "error": "[MAX_LIMIT_EXCEEDED] Quantidade muito longa", "codes": ["MAX_LIMIT_EXCEEDED"] }  

	   - Validar contexto → se não permitir dividir em cards (ex: qual a soma de 2 + 2), retornar:  
		 { "error": "[INVALID_CONTEXT] Contexto não suportado", "codes": ["INVALID_CONTEXT"] }
	
	# Formato de saída.
	{
		 "preferences": {
		   "language": string;
		   "difficulty": 'beginner' | 'intermediate' | 'advanced';
		   "topics": string[];
		   "source": 'user_input' | 'music' | 'movie' | 'book';
		 },
		"cards": [
			 {
			   "front": string,
			   "back": string
			   "tags": string[],
			   "examples": [
				 {
				   front: string,
				   back: string
				 },
				...
			   ]
	}
	
	# Regras gerais para a criação dos cards.
	   - Extrair termos-chaves reais (sem nomes próprios ou termos inventados).  
	   - Para mídia específica (filme, música, livro), usar palavras ou frases (caso solicitado) do conteúdo mencionado.  
	   - Para palavras, adicionar pronúncia fonética simples entre parênteses, clara e compreensível.  
		 - Em português por padrão, ou no idioma da descrição.  
		 - NUNCA use caracteres incomuns na pronuncia fonótica, como ('oʊpən) ou (sɛd)
		 - Crie uma pronuncia de acordo com a maneira que se fala naturalmente no idioma da descrição.
		 - Exemplo de pronuncia fonética válida:
		   - the (dhâ)  
		   - of (âv)  
		   - to (tuu)  
		   - and (énd)  
		   - open (ô-pen)

		- Exemplo de pronuncia fonética inválida:
		   - Forest (fɔr-əst) 
		   - open ('oʊpən) 
		   - Mountain (maʊn-tən)  
		   - Ocean (ō-shən)  
		   - Qualquer outra escrita com palavras que não são do alfabeto oficial
		   
	   	- Se o objetivo for gerar "palavras" (ex: "criar palavras em japonês com o verbo X"), então:  
		- 'card.front' deve conter a palavras no idioma alvo, com a pronuncia fonética.
		- 'card.back' deve conter a TRADUÇÃO da palavra. IMPORTANTE: somente a TRADUÇÃO da palavra de estudo.
		- 'examples' deve conter as "frases" com sua respectiva tradução (obrigatório):  
			- 'examples[].front': frase contendo a palavra do card.front  
			- 'examples[].back': TRADUÇÃO da frase de exemplo. IMPORTANTE: somente a TRADUÇÃO da frase de exemplo.  
			- Gerar 5 frases curtas (até 5 palavras) que incluam a palavra estudada e suas respectivas traduções.  
	   - Tags (máx. 3): idioma + categoria gramatical ou área temática.  

	# Regra especial para a criação de frases
	- Se o objetivo for gerar **frases** (ex: "criar frases em japonês com o verbo X"), então:  
	  - 'card.front' deve conter a frases completas no idioma alvo, sem a pronuncia fonética. 
	  - 'card.back' deve conter a TRADUÇÃO da frase completa. IMPORTANTE: somente a TRADUÇÃO da frase de estudo.
	  - 'examples' deve conter as "palavras-chave da frase" com sua respectiva tradução (obrigatório)::  
		- 'examples[].front': palavras chave da frase  
		- 'examples[].back': TRADUÇÃO das palavras chave da frase. IMPORTANTE: somente a TRADUÇÃO da das palavras chave de estudo.  
		- Gerar até 5 combinações (no mínimo 2 palavras da frase) com as palavras da frase do card.front e suas respectivas traduções.  
	  - NÃO deve conter pronúncia fonética. 
	  - Tags continuam obrigatórias.

	# Exemplos de saída.
		1. Exemplos de saída para palavras.
		 {
		   "preferences": {
			 "language": "inglês",
			 "difficulty": "beginner",
			 "topics": ["to-be", "verbos", "pronomes"],
			 "source": "user_input"
		   },
		   "cards": [
			 {
			   "front": "They (dei)",
			   "back": "Eles",
			   "tags": ["inglês", "to-be", "pronome"],
			   "examples": [
				 {
				   front: "They cut my water off.",
				   back: "Eles cortaram minha água."
				 },
				 ...
				 {
				   front: "They went to the park.",
				   back: "Eles foram ao parque."
				 },
			   ]
			 }
		   ]
		 }

		2. Exemplos de saída para frases.
		 {
		   "preferences": {
			 "language": "inglês",
			 "difficulty": "beginner",
			 "topics": ["to-be", "verbs"],
			 "source": "user_input"
		   },
		   "cards": [
			 {
			   "front": "The book is on the table",
			   "back": "O livro está sobre a mesa",
			   "tags": ["Inglês", "vocabulário", ...],
			   "examples": [
				 {
				   front: "Book - Table",
				   back: "Livro - Mesa"
				 },
				 ...
				  {
				   front: "The - Book -Table",
				   back: "O - Livro - Mesa"
				 },
			   ]
			 }
		   ]
		 }
	
	   	3. Em caso de erro, retornar SOMENTE:
		 {
		   "error": "mensagem do erro",
		   "codes": ["CÓDIGO_ERRO", …]
		 }

	# Regras extra
		- Retorne um JSON válido e SOMENTE um JSON válido.
		- Se for um deck de frases, todos os cards devem ter frases completas.
		- Cada card DEVE ter exemplos de estudo de acordo com as regras acima.
		- Siga estritamente todas as regras acima, sem exceções.
`

	const response = await anwer(prompt);
	const cards = extractJsonFromText(response)
	console.log(response)
	if(cards.error){
		throw new Error(cards.error);
	}
	return cards;
};

