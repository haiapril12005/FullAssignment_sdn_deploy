// npm run seed  -> RESETS the database in MONGODB_URI and fills it with sample data.
// Works for local MongoDB and MongoDB Atlas (put the Atlas URI in .env before running).
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { hashPassword } = require('../routes/userRoutes');

(async () => {
  await connectDB();
  await Promise.all([Quiz.deleteMany({}), Question.deleteMany({}), User.deleteMany({})]);

  const [mary] = await User.create([
    { username: 'mary', passwordHash: hashPassword('Mary@123'), admin: true },
    { username: 'john', passwordHash: hashPassword('John@123'), admin: false },
  ]);

  const q = (text, options, correctAnswerIndex, keywords = []) => ({
    text,
    options,
    correctAnswerIndex,
    keywords,
    author: mary._id,
  });

  const questions = await Question.insertMany([
    q('What is the capital of France?', ['Paris', 'London', 'Berlin', 'Madrid'], 0, ['capital']),
    q('What is the capital of England?', ['Paris', 'London', 'Berlin', 'Madrid'], 1, ['capital']),
    q('What is the capital of Germany?', ['Paris', 'London', 'Berlin', 'Madrid'], 2, ['capital']),
    q('What is the capital of Spain?', ['Paris', 'London', 'Berlin', 'Madrid'], 3, ['capital']),
    q('Who developed the theory of relativity?', ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'], 0, ['science']),
    q('What is the symbol for iron on the periodic table?', ['Fe', 'I', 'Au', 'Ag'], 0, ['science']),
    q('Which planet is known as the Red Planet?', ['Venus', 'Jupiter', 'Mars', 'Saturn'], 2, ['science']),
    q('What does HTTP stand for?', ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyper Tool Transfer Program', 'Home Text Transfer Protocol'], 0, ['web']),
    q('Which method creates a new resource in a REST API?', ['GET', 'POST', 'DELETE', 'HEAD'], 1, ['web']),
    q('Which library is used for state management in this app?', ['Redux', 'jQuery', 'Lodash', 'Moment'], 0, ['web']),
  ]);
  const ids = questions.map((x) => x._id);

  await Quiz.create([
    { title: 'Capital Cities', description: 'How well do you know European capitals?', questions: ids.slice(0, 4) },
    { title: 'Science Quiz', description: 'Test your knowledge of scientific concepts!', questions: ids.slice(4, 7) },
    { title: 'Web Development Basics', description: 'HTTP, REST and React.', questions: ids.slice(7, 10) },
  ]);

  console.log('Seeded 3 quizzes, 10 questions and 2 users:');
  console.log('  Admin: mary / Mary@123');
  console.log('  User : john / John@123');
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
