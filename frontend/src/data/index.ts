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
import { assessmentQuestions as question11 } from './questions11';
import { assessmentQuestions as question12 } from './questions12';
import { assessmentQuestions as question13 } from './questions13';
import { assessmentQuestions as question14 } from './questions14';
import { assessmentQuestions as question15 } from './questions15';

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
  'question-11': question11,
  'question-12': question12,
  'question-13': question13,
  'question-14': question14,
  'question-15': question15,
};

export const availableQuestions = [
  { id: 'question-1',  name: 'ICTCBL246 & ICTCBL247' },
  { id: 'question-2',  name: 'ICTCBL330' },
  { id: 'question-3',  name: 'ICTCBL322' },
  { id: 'question-4',  name: 'ICTCBL320' },
  { id: 'question-5',  name: 'ICTCBL254' },
  { id: 'question-6',  name: 'ICTTEN208' },
  { id: 'question-7',  name: 'ICTCBL333' },
  { id: 'question-8',  name: 'ICTBWN308' },
  { id: 'question-9',  name: 'ICTBWN307' },
  { id: 'question-10', name: 'ICTWHS204' },
  { id: 'question-11', name: 'ICTTEN318' },
  { id: 'question-12', name: 'ICTTEN313' },
  { id: 'question-13', name: 'ICTCBL301' },
  { id: 'question-14', name: 'ICTCBL303' },
  { id: 'question-15', name: 'ICTCBL334 ICTCBL329 ICTCBL249 ICTCBL253' },
];





export const getQuestionsForAssessment = (token: string | null) => {
  if (!token) return question1;
  const normalizedToken = token.toLowerCase();
  // Fallback to question1 if token is not found in the map
  return questionSets[normalizedToken] || question1;
};
