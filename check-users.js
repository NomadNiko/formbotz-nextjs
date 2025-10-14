// Check what users exist in the database
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const users = await User.find({}).select('email role createdAt');
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
