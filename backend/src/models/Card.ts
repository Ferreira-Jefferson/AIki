import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  front: string;
  back: string;
  viewedCount: number;
  easyCount: number,
  mediumCount: number,
  hardCount: number,
  nextReviewDate: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  deck: mongoose.Types.ObjectId;
}

const CardSchema: Schema = new Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    viewedCount: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: () => new Date() },
	easyCount: { type: Number, default: 0 },
	mediumCount: { type: Number, default: 0 },
	hardCount: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [{ type: String }],
    deck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true
    }
  },
  { timestamps: true }
);

export const Card = mongoose.model<ICard>('Card', CardSchema);
