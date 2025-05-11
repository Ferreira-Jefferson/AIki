import request from 'supertest';
import { Types } from 'mongoose';

import app from '../../index';
import { Deck, IDeck } from '../../models/Deck';
import { Card, ICard } from '../../models/Card';

describe('POST /api/cards', () => {
	// Adicionar limpeza do banco após cada teste
	afterEach(async () => {
		await Deck.deleteMany();
		});
	it('should create a new card for a deck', async () => {
	  const deck = await Deck.create({
		title: 'Geography Deck',
		description: 'Deck for geography questions',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['geography'],
		  source: 'user_input'
		},
		cards: []
	  }) as IDeck & { _id: Types.ObjectId };
  
	  const cardData = {
		front: 'What is the capital of France?',
		back: 'Paris',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString()
	  };
  
	  const response = await request(app)
	.post(`/api/decks/${deck._id}/cards`) // Garanta que deckId está sendo passado
	.send(cardData)
	.expect(201);
  
	  expect(response.body).toHaveProperty('_id');
	  expect(response.body.front).toBe(cardData.front);
	  expect(response.body.viewedCount).toBe(1);
	  expect(response.body.deck).toBe(deck._id.toString());
	});
  });
  
  describe('GET /api/decks/:deckId/cards', () => {
	it('should return all cards of a deck', async () => {
	  const deck = await Deck.create({
		title: 'Geography Deck',
		description: 'Deck for geography questions',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['geography'],
		  source: 'user_input',
		},
		cards: []
	  }) as IDeck & { _id: Types.ObjectId };
  
	  const cardData1 = {
		front: 'What is the capital of France?',
		back: 'Paris',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  const cardData2 = {
		front: 'What is the capital of Germany?',
		back: 'Berlin',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  // Criar os cards
	  await request(app).post(`/api/decks/${deck._id}/cards`).send(cardData1);
	  await request(app).post(`/api/decks/${deck._id}/cards`).send(cardData2);
  
	  // Verificar a resposta
	  const response = await request(app).get(`/api/decks/${deck._id}/cards`).expect(200);
	  expect(response.body).toHaveLength(2); // Espera-se que dois cards sejam retornados
	  expect(response.body[0]).toHaveProperty('front', 'What is the capital of France?');
	  expect(response.body[1]).toHaveProperty('front', 'What is the capital of Germany?');
	});
  });
  
  describe('GET /api/decks/:deckId/cards/:id', () => {
	it('should return a specific card from a deck', async () => {
	  const deck = await Deck.create({
		title: 'Geography Deck',
		description: 'Deck for geography questions',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['geography'],
		  source: 'user_input',
		},
		cards: []
	  }) as IDeck & { _id: Types.ObjectId };
  
	  const cardData = {
		front: 'What is the capital of France?',
		back: 'Paris',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  const cardResponse = await request(app).post(`/api/decks/${deck._id}/cards`).send(cardData).expect(201);
	  const cardId = cardResponse.body._id;
  
	  const response = await request(app).get(`/api/decks/${deck._id}/cards/${cardId}`).expect(200);
	  expect(response.body).toHaveProperty('_id', cardId);
	  expect(response.body.front).toBe('What is the capital of France?');
	});
  });
  
  describe('PUT /api/decks/:deckId/cards/:id', () => {
	it('should update a card in the deck', async () => {
	  const deck = await Deck.create({
		title: 'Geography Deck',
		description: 'Deck for geography questions',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['geography'],
		  source: 'user_input',
		},
		cards: []
	  }) as IDeck & { _id: Types.ObjectId };
  
	  const cardData = {
		front: 'What is the capital of France?',
		back: 'Paris',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  const cardResponse = await request(app).post(`/api/decks/${deck._id}/cards`).send(cardData).expect(201);
	  const cardId = cardResponse.body._id;
  
	  const updatedCardData = {
		front: 'What is the capital of France (updated)?',
		back: 'Paris',
		viewedCount: 2,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  const response = await request(app).put(`/api/decks/${deck._id}/cards/${cardId}`).send(updatedCardData).expect(200);
	  expect(response.body.front).toBe('What is the capital of France (updated)?');
	  expect(response.body.viewedCount).toBe(2);
	});
  });
  
  describe('DELETE /api/decks/:deckId/cards/:id', () => {
	it('should delete a card from the deck', async () => {
	  const deck = await Deck.create({
		title: 'Geography Deck',
		description: 'Deck for geography questions',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['geography'],
		  source: 'user_input',
		},
		cards: []
	  }) as IDeck & { _id: Types.ObjectId };
  
	  const cardData = {
		front: 'What is the capital of France?',
		back: 'Paris',
		viewedCount: 1,
		nextReviewDate: new Date().toISOString(),
		difficulty: 'medium',
		tags: ['geography', 'europe'],
		deck: deck._id.toString(),
	  };
  
	  const cardResponse = await request(app).post(`/api/decks/${deck._id}/cards`).send(cardData).expect(201);
	  const cardId = cardResponse.body._id;
  
	  await request(app).delete(`/api/decks/${deck._id}/cards/${cardId}`).expect(200);
  
	  // Verificar se o card foi realmente deletado
	  const response = await request(app).get(`/api/decks/${deck._id}/cards/${cardId}`).expect(404);
	  expect(response.body.error).toBe('Card não encontrado');
	});
  });
  

describe('POST /api/decks/:deckId/cards/:id/process-response', () => {
  let deck: IDeck;
  let card: ICard;

  // Limpar banco após cada teste
  afterEach(async () => {
    await Card.deleteMany();
    await Deck.deleteMany();
  });

  beforeEach(async () => {
    deck = await Deck.create({
      title: 'Geography Deck',
      description: 'Deck for geography questions',
      preferences: {
        language: 'en',
        difficulty: 'beginner',
        topics: ['geography'],
        source: 'user_input'
      },
      cards: []
    });

    // Criar um card para esse deck
    card = await Card.create({
      front: 'What is the capital of France?',
      back: 'Paris',
      viewedCount: 1,
      nextReviewDate: new Date(),
      difficulty: 'medium',
      tags: ['geography', 'europe'],
      deck: (deck  as IDeck & { _id: Types.ObjectId })._id.toString(),
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0
    });
  });

  it('should process card response and update counts and nextReviewDate', async () => {
    const response = await request(app)
      .post(`/api/decks/${deck._id}/cards/${card._id}/process-response`)
      .send({ difficulty: 'easy' })  // Simulando uma resposta fácil
      .expect(200);

    // Verificar se o card foi atualizado
    expect(response.body).toHaveProperty('_id', (card as ICard & { _id: Types.ObjectId })._id.toString());
    expect(response.body.easyCount).toBe(1);
    expect(response.body.mediumCount).toBe(0);
    expect(response.body.hardCount).toBe(0);

    // Verificar se a data de revisão foi atualizada (após um cálculo)
	expect(new Date(response.body.nextReviewDate).getTime()).toBeGreaterThan(new Date(card.nextReviewDate).getTime());
});

  it('should process card response and update counts and nextReviewDate for medium difficulty', async () => {
    const response = await request(app)
      .post(`/api/decks/${deck._id}/cards/${card._id}/process-response`)
      .send({ difficulty: 'medium' })  // Simulando uma resposta média
      .expect(200);

    expect(response.body.mediumCount).toBe(1);
    expect(response.body.easyCount).toBe(0);
    expect(response.body.hardCount).toBe(0);
	expect(new Date(response.body.nextReviewDate).getTime()).toBeGreaterThan(new Date(card.nextReviewDate).getTime());
});

  it('should process card response and update counts and nextReviewDate for hard difficulty', async () => {
    const response = await request(app)
      .post(`/api/decks/${deck._id}/cards/${card._id}/process-response`)
      .send({ difficulty: 'hard' })  // Simulando uma resposta difícil
      .expect(200);

    expect(response.body.hardCount).toBe(1);
    expect(response.body.easyCount).toBe(0);
    expect(response.body.mediumCount).toBe(0);
	expect(new Date(response.body.nextReviewDate).getTime()).toBeGreaterThan(new Date(card.nextReviewDate).getTime());
});

  it('should return 400 if difficulty is invalid', async () => {
    const response = await request(app)
      .post(`/api/decks/${deck._id}/cards/${card._id}/process-response`)
      .send({ difficulty: 'invalid' })  // Enviando uma dificuldade inválida
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid difficulty level');
  });
});
