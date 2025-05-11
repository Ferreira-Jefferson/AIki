import { ICard } from '../models/Card';

export const calculateNextReviewDate = (card: ICard): Date => {
  let daysToAdd = 1; 

  if (card.easyCount > 4) {
    daysToAdd = 3; 
  }

  if (card.mediumCount > 3) {
    daysToAdd = 2; 
  }

  if (card.hardCount > 3) {
    daysToAdd = 0.5; 
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

  return nextReviewDate;
};


export const updateDifficultyCounts = (card: ICard, difficulty: string): ICard => {
  card.viewedCount += 1;
  
  if (difficulty === 'easy') {
    card.easyCount += 1;
  } else if (difficulty === 'medium') {
    card.mediumCount += 1;
  } else if (difficulty === 'hard') {
    card.hardCount += 1;
  }
  card.nextReviewDate = calculateNextReviewDate(card);
  
  return card;
};
