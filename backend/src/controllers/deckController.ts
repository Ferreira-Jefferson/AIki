import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Deck, IDeck } from '../models/Deck';
import { createDeckWithCards } from '../services/deckService';
  
  
  export const createDeck = async (req: Request, res: Response): Promise<void> => {
	const deckData = req.body;
  
	try {
	  const deck = await createDeckWithCards(deckData);
	  res.status(201).json(deck);
	} catch (error: any) {
	  res.status(500).json({ message: 'Erro ao criar o deck e os cards', error: error.message });
	  return ;
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
	  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		res.status(400).json({ error: 'Invalid ID format' });
		return;
	  }
  
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
  
  export const updateDeck = async (req: Request, res: Response): Promise<void> => {
	  const { id } = req.params;
	  try {
		const updatedDeck = await Deck.findByIdAndUpdate(id, req.body, {
		  new: true, // Retorna o deck atualizado
		  runValidators: true, // Validações do mongoose
		});
	
		if (!updatedDeck) {
		  res.status(404).json({ error: 'Deck não encontrado' });
		  return ;
		}
	
		res.status(200).json({ message: 'Deck atualizado com sucesso' });
	  } catch (error: any) {
		res.status(400).json({ error: error.message });
	  }
	};
  
	export const deleteDeck = async (req: Request, res: Response): Promise<void> => {
	  const { id } = req.params;
	  try {
		const deletedDeck = await Deck.findByIdAndDelete(id);
	
		if (!deletedDeck) {
		  res.status(404).json({ error: 'Deck não encontrado' });
		  return ;
		}
	
		res.status(200).json({ message: 'Deck excluído com sucesso' });
	  } catch (error: any) {
		res.status(500).json({ error: error.message });
	  }
	};
	