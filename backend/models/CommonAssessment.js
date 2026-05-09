import mongoose from 'mongoose';

const CommonAssessmentSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  assessor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question_ids: [{ type: String }], // e.g., ['question-1', 'question-2']
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('CommonAssessment', CommonAssessmentSchema);
