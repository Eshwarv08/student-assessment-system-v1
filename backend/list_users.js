import mongoose from 'mongoose';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://Eshwarv:AssessmentPortal2024!@cluster0.yghlfxx.mongodb.net/student_assessment?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    let u = await User.findOne({ email: 'admin@test.com' });
    if (!u) {
      u = new User({ email: 'admin@test.com', password: 'password' });
    } else {
      u.password = 'password';
    }
    await u.save();
    console.log('Successfully set admin@test.com password to "password"!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
