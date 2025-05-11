import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../../index';
import { Deck, IDeck } from '../../models/Deck';
import { Card, ICard } from '../../models/Card';

describe('GET /api/decks/:deckId/review', () => {
	it('should return cards due for review', async () => {
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
	  const deck = await Deck.create(deckData);
  
	  const dueCard = await Card.create({
		front: 'Capital of France?',
		back: 'Paris',
		deck: deck._id,
		nextReviewDate: new Date(Date.now() - 1000), // ontem
		viewedCount: 2,
		difficulty: 'medium',
		tags: []
	  });
  
	  const futureCard = await Card.create({
		front: 'Capital of Germany?',
		back: 'Berlin',
		deck: deck._id,
		nextReviewDate: new Date(Date.now() + 86400000), // amanhã
		viewedCount: 1,
		difficulty: 'easy',
		tags: []
	  });
  
	  const res = await request(app)
		.get(`/api/decks/${deck._id}/review`)
		.expect(200);
  
	  expect(res.body.length).toBe(1);
	  expect(res.body[0].front).toBe('Capital of France?');
	});
  });
  