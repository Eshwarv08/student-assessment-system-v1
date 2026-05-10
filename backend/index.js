import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from the backend folder itself
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import User from './models/User.js';
import Assessment from './models/Assessment.js';
import Submission from './models/Submission.js';
import CommonAssessment from './models/CommonAssessment.js';


const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set! Check your backend/.env file.');
  process.exit(1);
}

// Connect to MongoDB
let cachedDb = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  console.log('⏳ Connecting to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Reduced for faster failure
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
};

// Initial connection for local development
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase().catch(err => {
    console.warn('⚠️ Initial connection failed. Will retry on first request.');
  });
}

// Middleware to ensure DB is connected
const checkDbConnection = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ 
      error: 'Database connection failed. Please check your MONGODB_URI and IP whitelist.',
      details: err.message 
    });
  }
};

// --- Auth Middleware ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// --- Auth Routes ---

// Register (initial setup)
app.post('/api/auth/register', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    const user = new User({ email, password });
    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, id: user._id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
app.get('/api/auth/me', checkDbConnection, authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Assessment Routes ---

// Create Assessment Link
app.post('/api/assessments', checkDbConnection, authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const templateName = name || 'Question 1';
    // Create a static token out of the template name
    const staticToken = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if an assessment with this token already exists
    let assessment = await Assessment.findOne({ token: staticToken });
    
    if (assessment) {
      // If it exists, return it (static, unique link)
      return res.json(assessment);
    }

    assessment = new Assessment({
      token: staticToken,
      assessor_id: req.userId,
      name: templateName,
      // No expires_at, so it remains valid permanently
    });
    await assessment.save();
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assessments (assessor's own)
app.get('/api/assessments', checkDbConnection, authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ assessor_id: req.userId }).sort({ created_at: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate token (public — student access)
app.get('/api/assessments/validate/:token', checkDbConnection, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ token: req.params.token });
    if (!assessment) return res.status(404).json({ error: 'Invalid or expired assessment link.' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Common Assessment Routes ---

// Create Common Assessment Link (Multi-select)
app.post('/api/common-assessments', checkDbConnection, authenticate, async (req, res) => {
  try {
    const { question_ids } = req.body;
    if (!question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
      return res.status(400).json({ error: 'At least one question must be selected.' });
    }
    
    // Generate a unique token
    const token = uuidv4().slice(0, 8);
    
    const commonAssessment = new CommonAssessment({
      token,
      assessor_id: req.userId,
      question_ids
    });
    
    await commonAssessment.save();
    res.json(commonAssessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all common assessments (assessor's own)
app.get('/api/common-assessments', checkDbConnection, authenticate, async (req, res) => {
  try {
    const assessments = await CommonAssessment.find({ assessor_id: req.userId }).sort({ created_at: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate common token (public — student access)
app.get('/api/common-assessments/validate/:token', checkDbConnection, async (req, res) => {
  try {
    const assessment = await CommonAssessment.findOne({ token: req.params.token });
    if (!assessment) return res.status(404).json({ error: 'Invalid or expired common assessment link.' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Submission Routes ---

// Submit Assessment (public — no auth needed)
app.post('/api/submissions', checkDbConnection, async (req, res) => {
  try {
    const { assessment_id, student_name, student_id, answers, signature_url } = req.body;
    const submission = new Submission({
      assessment_id,
      student_name,
      student_id,
      answers,
      signature_url,
      status: 'pending'
    });
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all submissions (assessor only)
app.get('/api/submissions', checkDbConnection, authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ assessor_id: req.userId });
    const assessmentIds = assessments.map(a => a._id);
    const submissions = await Submission.find({ assessment_id: { $in: assessmentIds } })
      .populate('assessment_id', 'token name')
      .sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single submission for grading
app.get('/api/submissions/:id', checkDbConnection, authenticate, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('assessment_id');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update grades
app.put('/api/submissions/:id', checkDbConnection, authenticate, async (req, res) => {
  try {
    const { grades, task_results, final_result, comp_record, status } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grades, task_results, final_result, comp_record, status: status || 'graded' },
      { new: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check submission status for a student (public)
app.get('/api/submissions/status/:studentId', checkDbConnection, async (req, res) => {
  try {
    const { studentId } = req.params;
    // Find all submissions by this student
    const submissions = await Submission.find({ student_id: studentId })
      .populate('assessment_id', 'token');
    
    // Return a list of tokens that have been completed
    const completedTokens = submissions
      .filter(s => s.assessment_id)
      .map(s => s.assessment_id.token);
      
    res.json({ completedTokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the app for Vercel serverless functions
export default app;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Try running 'npx kill-port ${PORT}' or change the port in .env.`);
    } else {
      console.error('❌ Server Error:', err.message);
    }
    process.exit(1);
  });
}

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

