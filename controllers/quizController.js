const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const { FIELDS: QUESTION_FIELDS } = require('./questionController');

const QUIZ_FIELDS = ['title', 'description', 'questions'];

async function findQuizOr404(id, populate) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid quiz id');
  let query = Quiz.findById(id);
  if (populate) query = query.populate(populate);
  const quiz = await query;
  if (!quiz) throw new HttpError(404, 'Quiz not found');
  return quiz;
}

// Validation: every id in body.questions must be a real Question
async function checkQuestionIds(ids) {
  if (ids === undefined) return;
  if (!Array.isArray(ids)) throw new HttpError(400, 'questions must be an array of question ids');
  if (!ids.every((id) => mongoose.isValidObjectId(id))) throw new HttpError(400, 'Invalid question id in questions');
  const unique = [...new Set(ids.map(String))];
  const count = await Question.countDocuments({ _id: { $in: unique } });
  if (count !== unique.length) throw new HttpError(400, 'Some questions do not exist');
}

// GET /quizzes  -> every quiz with its questions populated
exports.getAll = asyncHandler(async (req, res) => {
  res.json(await Quiz.find().populate('questions'));
});

// GET /quizzes/:quizId
exports.getOne = asyncHandler(async (req, res) => {
  res.json(await findQuizOr404(req.params.quizId, 'questions'));
});

// POST /quizzes
exports.create = asyncHandler(async (req, res) => {
  await checkQuestionIds(req.body.questions);
  const quiz = await Quiz.create(pick(req.body, QUIZ_FIELDS));
  await quiz.populate('questions');
  res.status(201).json(quiz);
});

// PUT /quizzes/:quizId
exports.update = asyncHandler(async (req, res) => {
  const quiz = await findQuizOr404(req.params.quizId);
  await checkQuestionIds(req.body.questions);
  quiz.set(pick(req.body, QUIZ_FIELDS));
  await quiz.save();
  await quiz.populate('questions');
  res.json(quiz);
});

// DELETE /quizzes
exports.removeAll = asyncHandler(async (req, res) => {
  const result = await Quiz.deleteMany({});
  res.json({ message: 'All quizzes deleted', result });
});

// DELETE /quizzes/:quizId
exports.remove = asyncHandler(async (req, res) => {
  const quiz = await findQuizOr404(req.params.quizId);
  await quiz.deleteOne();
  res.json({ message: 'Quiz deleted', quiz });
});

// GET /quizzes/:quizId/populate -> quiz with ONLY the questions that match the word "capital"
exports.populateCapital = asyncHandler(async (req, res) => {
  const quiz = await findQuizOr404(req.params.quizId, {
    path: 'questions',
    match: { $or: [{ text: /capital/i }, { keywords: /capital/i }] },
  });
  res.json(quiz);
});

// POST /quizzes/:quizId/question -> create ONE new question inside the quiz
exports.addQuestion = asyncHandler(async (req, res) => {
  const quiz = await findQuizOr404(req.params.quizId);
  const question = await Question.create({ ...pick(req.body, QUESTION_FIELDS), author: req.user._id });
  quiz.questions.push(question._id);
  await quiz.save();
  await quiz.populate('questions');
  res.status(201).json(quiz);
});

// POST /quizzes/:quizId/questions -> create MANY new questions inside the quiz
// body: [ {...}, {...} ]   or   { "questions": [ {...}, {...} ] }
exports.addQuestions = asyncHandler(async (req, res) => {
  const quiz = await findQuizOr404(req.params.quizId);
  const list = Array.isArray(req.body) ? req.body : req.body && req.body.questions;
  if (!Array.isArray(list) || list.length === 0) {
    throw new HttpError(400, 'Body must be a non-empty array of questions');
  }
  const created = await Question.insertMany(
    list.map((q) => ({ ...pick(q, QUESTION_FIELDS), author: req.user._id }))
  );
  quiz.questions.push(...created.map((q) => q._id));
  await quiz.save();
  await quiz.populate('questions');
  res.status(201).json(quiz);
});

