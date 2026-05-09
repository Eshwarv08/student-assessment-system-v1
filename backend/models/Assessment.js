import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  assessor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default: 'Question 1' },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Assessment', AssessmentSchema);
