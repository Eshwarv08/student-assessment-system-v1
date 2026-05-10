import { assessmentQuestions as question1 } from './questions';
import { assessmentQuestions as question2 } from './questions2';
import { assessmentQuestions as question3 } from './questions3';
import { assessmentQuestions as question4 } from './questions4';
import { assessmentQuestions as question5 } from './questions5';
import { assessmentQuestions as question6 } from './questions6';
import { assessmentQuestions as question7 } from './questions7';
import { assessmentQuestions as question8 } from './questions8';
import { assessmentQuestions as question9 } from './questions9';
import { assessmentQuestions as question10 } from './questions10';




// Instructions for adding new questions in the future:
// 1. Create a new file (e.g., questions2.ts) based on questions.ts
// 2. Import it here: import { assessmentQuestions as question2 } from './questions2';
// 3. Add it to the questionSets object below with the corresponding token name as the key.

export const questionSets: Record<string, any> = {
  'question-1': question1,
  'question-2': question2,
  'question-3': question3,
  'question-4': question4,
  'question-5': question5,
  'question-6': question6,
  'question-7': question7,
  'question-8': question8,
  'question-9': question9,
  'question-10': question10,

};



export const availableQuestions = [
  { id: 'question-1', name: 'Question 1' },
  { id: 'question-2', name: 'Question 2' },
  { id: 'question-3', name: 'Question 3' },
  { id: 'question-4', name: 'Question 4' },
  { id: 'question-5', name: 'Question 5' },
  { id: 'question-6', name: 'Question 6' },
  { id: 'question-7', name: 'Question 7' },
  { id: 'question-8', name: 'Question 8' },
  { id: 'question-9', name: 'Question 9' },
  { id: 'question-10', name: 'Question 10' },

];



export const getQuestionsForAssessment = (token: string | null) => {
  if (!token) return question1;
  const normalizedToken = token.toLowerCase();
  // Fallback to question1 if token is not found in the map
  return questionSets[normalizedToken] || question1;
};
