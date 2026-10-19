const mongoose = require('mongoose');

async function connectDB() {
  // Local:  mongodb://127.0.0.1:27017/SimpleQuiz
  // Deploy: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/SimpleQuiz  (MongoDB Atlas)
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz';
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
