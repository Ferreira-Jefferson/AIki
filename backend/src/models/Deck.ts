import mongoose, { Document, Schema } from 'mongoose';
import { ICard } from './Card'; // Importe o tipo do Card, assumindo que o schema de Card está no arquivo 'Card.ts'

export interface IDeckPreferences {
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  source: 'user_input' | 'music' | 'movie' | 'book';
}

export interface IDeck extends Document {
  title: string;
  description: string;
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
