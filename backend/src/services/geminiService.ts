import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
import { IDeck, IGeneratedDeck } from "src/models/Deck";

dotenv.config();
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
	throw new Error('API key for Google GenAI is not defined in the environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function answer(prompt: string) {
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
	const result = await model.generateContent(prompt);
	const response = await result.response;
	return response.text();
  }

async function answerWithStreaming(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let fullText: string | undefined = "";
	let gemini_error: string = "";
    try {
        const result = await model.generateContentStream(prompt);
        let i = 0;
        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                fullText += text;
            }
            i++;
        }
        return fullText;
    } catch (error) {
        console.error("Ocorreu um erro durante o streaming:", error);
		gemini_error = "GEMINI_ERROR";
        return gemini_error;
    }
}

  export function extractJsonFromText(text: string): any {
	const match = text.match(/```json\n([\s\S]*?)\n```/);
	if (!match) throw new Error('Bloco JSON não encontrado');
	
	try {
		const validJson = JSON.parse(match[1].replace('```json', "").replace('```', ""));
		return validJson
	} catch (error: any) {
	  throw new Error('JSON inválido: ' + error.message);
	}
  }

async function validadeResponse(response: string)
{
	if(!response.split('\n').join('').trim().endsWith('```'))
	{
		const promptSanitazed = `
			Se o json estiver quebrado e não estiver válido, me ajude a corrigir para que fique.
			- Não altere nenhuma informação do json
			- Se o json estiver sem o fechamento, ELIMINE o último item do card, feche o array do card e feche o json corretamente
			- Se tiver agum texto explicativo pode remover tudo, deixe apenas o conteúdo de json inalterado.
			- JAMAIS invente algo que não esta no json passado.

			# Formato de um json válido.
			{
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
						{
						front: string,
						back: string
						}
					]
			}

			##############
			${response}
			##############
			
			Garanta a todo custo que o json retornado seja válido e com o máximo de conteúdo possível, nem que seja necessário remover o último e penúltimo elemento do array
			Retorne apenas um json válido.
		`;

		response =  await answer(promptSanitazed);
	} 
	return response;
}

async function createPreferences(description:string) {
	const prompt: string = `
    Com base na seguinte descrição, determine as preferências do deck:

    # Descrição do deck:
    "${description}"

    # Regras:
    - Identifique o idioma baseado na descrição. Se não for possível, use o idioma da própria descrição.
    - Determine a dificuldade baseada no tema.
    - Identifique os tópicos principais com base na descrição.
    - Se houver menção a uma mídia (música, livro, filme), defina a fonte como a mídia mencionada, caso contrário, defina como "user_input".
    - Retorne um JSON válido, no seguinte formato:

    {
        "preferences": {
            "language": string,
            "difficulty": "beginner" | "intermediate" | "advanced",
            "topics": string[],
            "source": "user_input" | "music" | "movie" | "book"
        }
    }
`;
	const response = await answer(prompt);
	return extractJsonFromText(response)
}

async function createCards(deck: IDeck)
{
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
			- Gerar 3 frases curtas (até 5 palavras) que incluam a palavra estudada e suas respectivas traduções.  
	   - Tags (máx. 3): idioma + categoria gramatical ou área temática.  

	# Regra especial para a criação de frases
	- Se o objetivo for gerar **frases** (ex: "criar frases em japonês com o verbo X"), então:  
	  - 'card.front' deve conter a frases completas no idioma alvo, sem a pronuncia fonética. 
	  - 'card.back' deve conter a TRADUÇÃO da frase completa. IMPORTANTE: somente a TRADUÇÃO da frase de estudo.
	  - 'examples' deve conter as "palavras-chave da frase" com sua respectiva tradução (obrigatório)::  
		- 'examples[].front': palavras chave da frase  
		- 'examples[].back': TRADUÇÃO das palavras chave da frase. IMPORTANTE: somente a TRADUÇÃO da das palavras chave de estudo.  
		- Gerar até 3 combinações (no mínimo 2 palavras da frase) com as palavras da frase do card.front e suas respectivas traduções.  
	  - NÃO deve conter pronúncia fonética. 
	  - Tags continuam obrigatórias.

	# Exemplos de saída.
		1. Exemplos de saída para palavras.
		 {
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
		- Se for solicitado palavras: FAÇA UM DECK SÓ COM PALAVRAS
		- Se for solicitado frases: FAÇA UM DECK SÓ COM FRASES
		- Siga estritamente todas as regras acima, sem exceções.
`
		const response = await answerWithStreaming(prompt);
		const validatedResponse = await validadeResponse(response)
		return extractJsonFromText(validatedResponse)
}

export type MCPResponse = {
    calls: number[];
    formatted_request: string;
};

export const mcpDefineQuantityOfCall = async (description: string): Promise<MCPResponse>=>
{
const prompt = `
    Solicitação: ${description}

    ####
    1. Analise a solicitação do usuário e determine a quantidade de chamadas necessárias.
       - Cada chamada pode conter no máximo 10 solicitações.
       - Se a solicitação não permitir definir um número claro, considere um total de 50 como padrão.

    2. Formate a solicitação do usuário substituindo números de quantidade pelo marcador "[%]".
       - Se a quantidade não for explícita, insira "[%]" no local onde deveria estar.
       - Se a solicitação não incluir uma quantidade definida, reformule para indicar a necessidade da geração. SEM mudar a solicitação. 
       
    Retorne um JSON válido no seguinte formato:
    {
        "calls": number[],
        "formatted_request": "string"
    }

    Exemplos:
    - "Gere 33 palavras que comecem com A" → { "calls": [10, 10, 10, 3], "formatted_request": "Gere [%] palavras que comecem com A" }
    - "Gere 21 frases sobre amor" → { "calls": [10, 10, 1], "formatted_request": "Gere [%] frases sobre amor" }
    - "Gere algo sobre superação" → { "calls": [10, 10, 10, 10, 10], "formatted_request": "Gere [%] palavras sobre superação" }
    - "Música do Akon" → { "calls": [10, 10, 10, 10, 10], "formatted_request": "Gere [%] palavras da música do Akon" }
	
	Importante:
	- O número pode estar apenas escrito, mas deve ser tranformado em numeral. Ex: Nove -> 9
	- Tenha certeza de que o número é exatamente o número solicitado.	
	`;

	try {
		const response = await answer(prompt);
		return extractJsonFromText(response) as MCPResponse;
	} catch(err: any)
	{
		throw new Error(`Erro em mcpDefineQuantityOfCall: ${err}`);
	}
	
}

export const generateCardsWithAI = async (deck: IDeck): Promise<IGeneratedDeck> => {
	const mcp = await mcpDefineQuantityOfCall(deck.description);
	const response = await createPreferences(deck.description);
	let deckResponse: IGeneratedDeck = { preferences: response.preferences, cards: [] };

	for(let call of mcp.calls) {
		deck.description = mcp.formatted_request.replace('[%]', `[${call}]`)
		const cards = await createCards(deck);
		if(cards.error){
			console.error("Um erro ocorreu em GeminiService.")
			throw new Error(cards.error);
		} 
		
		deckResponse.cards = [...deckResponse.cards, ...cards.cards];
		const existentItens = deckResponse.cards.map(card => card.front).join(', ')
		deck.description += `\n\n####\nNÃO crie com as seguintes itens pois já existe no card: \n${existentItens}`
	}
	return deckResponse;
};

