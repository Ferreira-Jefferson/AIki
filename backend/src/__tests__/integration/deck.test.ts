import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../../index';
import { Deck, IDeck } from '../../models/Deck';

describe('Deck API', () => {
	// Adicionar limpeza do banco após cada teste
	afterEach(async () => {
	  await Deck.deleteMany();
	});

	describe('POST /api/decks', () => {
		it('should create a new deck', async () => {
		  const deckData = {
			title: 'Test Deck',
			description: 'Test Description',
			preferences: {
			  language: 'en',
			  difficulty: 'beginner',
			  topics: ['test'],
			  source: 'user_input'
			}
		  };
	  
		  const response = await request(app)
			.post('/api/decks')
			.send(deckData)
			.expect(201);
	  
		  expect(response.body).toHaveProperty('_id');
		  expect(response.body.title).toBe(deckData.title);
		  expect(response.body.description).toBe(deckData.description);
		  expect(response.body.cards).toHaveLength(0);
		});
	  
		it('should validate required fields', async () => {
		  const response = await request(app)
			.post('/api/decks')
			.send({})
			.expect(400);
	  
		  expect(response.body).toHaveProperty('error');
		  expect(response.body.error).toMatch(/is required/);
		});
	  });
	
	describe('GET /api/decks', () => {
	  it('should return all decks', async () => {
		await Deck.create([
		  {
			title: 'Deck 1',
			description: 'Description 1',
			preferences: {
			  language: 'en',
			  difficulty: 'beginner',
			  topics: ['test'],
			  source: 'user_input'
			},
			cards: []
		  },
		  {
			title: 'Deck 2',
			description: 'Description 2',
			preferences: {
			  language: 'en',
			  difficulty: 'beginner',
			  topics: ['test'],
			  source: 'user_input'
			},
			cards: []
		  }
		]);
  
		const response = await request(app)
		  .get('/api/decks')
		  .expect(200);
  
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body).toHaveLength(2);
	  });
  
	  it('should return empty array when no decks are found', async () => {
		const response = await request(app)
		  .get('/api/decks')
		  .expect(200);
  
		expect(response.body).toHaveLength(0);
	  });
	});
  
	describe('GET /api/decks/:id', () => {
	  it('should return a deck by id', async () => {
		const deckData = {
		  title: 'Test Deck',
		  description: 'Test Description',
		  preferences: {
			language: 'en',
			difficulty: 'beginner',
			topics: ['test'],
			source: 'user_input'
		  },
		  cards: []
		};
  
		const deck = await Deck.create(deckData) as IDeck & { _id: Types.ObjectId };
		const deckId = deck._id.toString();
  
		const response = await request(app)
		  .get(`/api/decks/${deckId}`)
		  .expect(200);
  
		expect(response.body).toHaveProperty('_id', deckId);
		expect(response.body.title).toBe(deckData.title);
	  });
  
	  it('should return 404 for non-existent deck', async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const response = await request(app)
		  .get(`/api/decks/${fakeId}`)
		  .expect(404);
  
		expect(response.body).toHaveProperty('error');
	  });
  
	  it('should return 400 for invalid ID format', async () => {
		const response = await request(app)
		  .get('/api/decks/invalid-id')
		  .expect(400);
  
		expect(response.body).toHaveProperty('error');
	  });
	});
  });

  describe('PUT /api/decks/:id', () => {
	it('should update an existing deck', async () => {
	  // Cria um deck de teste
	  const deckData = {
		title: 'Test Deck',
		description: 'Test Description',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['test'],
		  source: 'user_input'
		},
		cards: []
	  };
  
	  const deck = await Deck.create(deckData) as IDeck & { _id: Types.ObjectId };
	  const deckId = deck._id.toString();
  
	  // Dados para atualização
	  const updatedData = {
		title: 'Updated Test Deck',
		description: 'Updated Test Description'
	  };
  
	  const response = await request(app)
		.put(`/api/decks/${deckId}`)
		.send(updatedData)
		.expect(200);
  
	  expect(response.body).toHaveProperty('message', 'Deck atualizado com sucesso');
	  expect(response.body).not.toHaveProperty('error');
	});
  
	it('should return an error if the deck is not found', async () => {
	  const fakeId = new mongoose.Types.ObjectId();
	  const response = await request(app)
		.put(`/api/decks/${fakeId}`)
		.send({ title: 'Updated Test Deck' })
		.expect(404);
  
	  expect(response.body).toHaveProperty('error', 'Deck não encontrado');
	});
  });
  
  describe('DELETE /api/decks/:id', () => {
	it('should delete an existing deck', async () => {
	  const deckData = {
		title: 'Test Deck',
		description: 'Test Description',
		preferences: {
		  language: 'en',
		  difficulty: 'beginner',
		  topics: ['test'],
		  source: 'user_input'
		},
		cards: []
	  };
  
	  const deck = await Deck.create(deckData) as IDeck & { _id: Types.ObjectId };
	  const deckId = deck._id.toString();
  
	  const response = await request(app)
		.delete(`/api/decks/${deckId}`)
		.expect(200);
  
	  expect(response.body).toHaveProperty('message', 'Deck excluído com sucesso');
	});
  
	it('should return an error if the deck is not found', async () => {
	  const fakeId = new mongoose.Types.ObjectId();
	  const response = await request(app)
		.delete(`/api/decks/${fakeId}`)
		.expect(404);
  
	  expect(response.body).toHaveProperty('error', 'Deck não encontrado');
	});
  });
  