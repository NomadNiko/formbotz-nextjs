// Check latest submission data
const mongoose = require('mongoose');
require('dotenv').config();

async function checkSubmissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const Submission = mongoose.model('Submission', new mongoose.Schema({}, { strict: false }));

    const submissions = await Submission.find({}).sort({ createdAt: -1 }).limit(3);
    console.log('Latest submissions:');

    submissions.forEach((sub, i) => {
      console.log(`\n--- Submission ${i + 1} ---`);
      console.log('ID:', sub._id);
      console.log('Session:', sub.sessionId);
      console.log('Data:', sub.data);
      console.log('Data as Map:', Object.fromEntries(sub.data || new Map()));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSubmissions();
