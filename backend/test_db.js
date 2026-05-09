
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import User from './models/User.js';
import Assessment from './models/Assessment.js';
import Submission from './models/Submission.js';

console.log('Testing models...');
console.log('User:', User.modelName);
console.log('Assessment:', Assessment.modelName);
console.log('Submission:', Submission.modelName);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { 
    console.log('✅ Connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
