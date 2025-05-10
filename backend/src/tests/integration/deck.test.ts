import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../index';
import { Deck } from '../../models/Deck';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Deck.deleteMany({});
});

describe('Deck API', () => {
  describe('POST /api/decks', () => {
    it('should create a new deck', async () => {
      const deckData = {
        title: 'Test Deck',
        description: 'Test Description',
        cards: [
          {
            front: 'Question 1',
            back: 'Answer 1',
            tags: ['test']
          }
        ]
      };

      const response = await request(app)
        .post('/api/decks')
        .send(deckData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(deckData.title);
      expect(response.body.description).toBe(deckData.description);
      expect(response.body.cards).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/decks')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/decks', () => {
    it('should return all decks', async () => {
      // Create test decks
      await Deck.create([
        {
          title: 'Deck 1',
          description: 'Description 1',
          cards: []
        },
        {
          title: 'Deck 2',
          description: 'Description 2',
          cards: []
        }
      ]);

      const response = await request(app)
        .get('/api/decks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/decks/:id', () => {
    it('should return a deck by id', async () => {
      const deck = await Deck.create({
        title: 'Test Deck',
        description: 'Test Description',
        cards: []
      });

      const response = await request(app)
        .get(`/api/decks/${deck._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', deck._id.toString());
      expect(response.body.title).toBe(deck.title);
    });

    it('should return 404 for non-existent deck', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/decks/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 