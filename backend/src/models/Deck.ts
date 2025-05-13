import mongoose, { Document, Schema } from 'mongoose';
import { ICard } from './Card'; // Importe o tipo do Card, assumindo que o schema de Card está no arquivo 'Card.ts'

export interface ICardsDifficulty {
    easy: number;
    medium: number;
    hard: number;
}

export interface IDeckPreferences {
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  source: 'user_input' | 'music' | 'movie' | 'book';
}

export interface IDeck extends Document {
  title: string;
  description: string;
  cardsDifficulty: ICardsDifficulty
  preferences: IDeckPreferences;
  cards: mongoose.Types.ObjectId[];  
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema = new Schema<IDeck>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  cardsDifficulty: {
	easy: {
		type: Number,
		default: 0,
		min: 0 
	  },
    medium: {
		type: Number,
		default: 0,
		min: 0 
	  },
    hard: {
		type: Number,
		default: 0,
		min: 0 
	  },
  },
  preferences: {
    language: {
      type: String,
      required: false,
      trim: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    topics: {
      type: [String],
      required: false
    },
    source: {
      type: String,
      required: true,
      enum: ['user_input', 'music', 'movie', 'book'],
	  default: 'user_input'
    }
  },
  cards: [{
    type: Schema.Types.ObjectId, 
    ref: 'Card'
  }]
}, {
  timestamps: true
});

export const Deck = mongoose.model<IDeck>('Deck', DeckSchema);
