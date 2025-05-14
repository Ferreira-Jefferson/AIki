
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Card, ICard } from '../models/Card';
import { Deck } from '../models/Deck';
import * as cardService from '../services/cardService';

export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId } = req.params;
    const { front, back, viewedCount, nextReviewDate, difficulty, tags } = req.body;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck não encontrado' });
	  return;
    }

    const card = await Card.create({
      front,
      back,
      viewedCount,
      nextReviewDate,
      difficulty,
      tags,
      deck: deckId
    }) as ICard & { _id: Types.ObjectId };

    deck.cards.push(card._id);
    await deck.save();

    res.status(201).json(card);
	return;
  } catch (error) {
    console.error('Erro ao criar card:', error);
    res.status(500).json({ error: 'Erro ao criar o card' });
	return;
  }
};

export const getCards = async (req: Request, res: Response): Promise<void> => {
	try {
	  const { deckId } = req.params;
  
	  const cards = await Card.find({ deck: deckId })
		.sort({ nextReviewDate: 1 })
		.exec();
  
	  res.status(200).json(cards);
	} catch (error) {
	  console.error('Erro ao listar os cards:', error);
	  res.status(500).json({ error: 'Erro ao listar os cards' });
	}
  };

export const getCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, id } = req.params;

    const deck = await Deck.findById(deckId).populate('cards');
    if (!deck) {
      res.status(404).json({ error: 'Deck não encontrado' });
	  return;
    }

    const card = deck.cards.find((card) => card._id.toString() === id);
    if (!card) {
      res.status(404).json({ error: 'Card não encontrado' });
	  return;
    }

    res.status(200).json(card);
	return;
  } catch (error) {
    console.error('Erro ao obter card:', error);
    res.status(500).json({ error: 'Erro ao obter o card' });
	return;
  }
};

export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, id } = req.params;
    const { front, back, viewedCount, nextReviewDate, difficulty, tags } = req.body;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck não encontrado' });
	  return;
    }

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ error: 'Card não encontrado' });
	  return;
    }

    card.front = front ?? card.front;
    card.back = back ?? card.back;
    card.viewedCount = viewedCount ?? card.viewedCount;
    card.nextReviewDate = nextReviewDate ?? card.nextReviewDate;
    card.difficulty = difficulty ?? card.difficulty;
    card.tags = tags ?? card.tags;

    await card.save();

    res.status(200).json(card);
	return;
  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({ error: 'Erro ao atualizar o card' });
	return;
  }
};

export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, id } = req.params;

    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: 'Deck não encontrado' });
	  return;
    }

    const card = await Card.findById(id);
    if (!card) {
      res.status(404).json({ error: 'Card não encontrado' });
	  return;
    }

    await Card.deleteOne({ _id: id });
    deck.cards = deck.cards.filter((card) => card.toString() !== id);
    await deck.save();

    res.status(200).json({ message: 'Card deletado com sucesso' });
	return;
  } catch (error) {
    console.error('Erro ao deletar card:', error);
    res.status(500).json({ error: 'Erro ao deletar o card' });
	return;
  }
};

// Endpoint para processar a resposta do card
export const processCardResponse = async (req: Request, res: Response): Promise<void> => {
	const { difficulty } = req.body;
	const cardId = req.params.id;
	
  try {
    const updatedCard = await cardService.processCardResponse(cardId, difficulty);
    res.status(200).json(updatedCard);
	return;
  } catch (error: any) {
    res.status(400).json({ error: error.message });
	return;
  }
};
