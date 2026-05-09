import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  student_name: { type: String, required: true },
  student_id: { type: String },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  signature_url: { type: String }, // Base64 signature
  status: { type: String, default: 'pending' },
  grades: { type: mongoose.Schema.Types.Mixed, default: {} },
  task_results: { type: mongoose.Schema.Types.Mixed, default: {} },
  final_result: { type: String },
  submitted_at: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', SubmissionSchema);
