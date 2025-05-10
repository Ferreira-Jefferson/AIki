import { Request, Response } from 'express';
import { Deck, IDeck } from '../models/Deck';

export const createDeck = async (req: Request, res: Response): Promise<void> => {
	try {
	  const deck = new Deck(req.body);
	  await deck.save();
	  res.status(201).json(deck);
	} catch (error: any) {
	  res.status(400).json({ error: error.message });
	}
  };
  

export const getAllDecks = async (req: Request, res: Response): Promise<void> => {
  try {
    const decks = await Deck.find();
    res.json(decks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeckById = async (req: Request, res: Response): Promise<void> => {
	try {
	  const deck = await Deck.findById(req.params.id);
	  if (!deck) {
		res.status(404).json({ error: 'Deck not found' });
		return;
	  }
	  res.json(deck);
	} catch (error: any) {
	  res.status(500).json({ error: error.message });
	}
  };
  