const mongoose = require('mongoose');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');

const FIELDS = ['text', 'options', 'keywords', 'correctAnswerIndex'];

async function findQuestionOr404(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid question id');
  const question = await Question.findById(id);
  if (!question) throw new HttpError(404, 'Question not found');
  return question;
}

// GET /questions  (public) - author populated with username only
exports.getAll = asyncHandler(async (req, res) => {
  res.json(await Question.find().populate('author', 'username'));
});

// GET /questions/:questionId  (public)
exports.getOne = asyncHandler(async (req, res) => {
  const question = await findQuestionOr404(req.params.questionId);
  await question.populate('author', 'username');
  res.json(question);
});

// POST /questions  (verifyUser) - the author is ALWAYS the logged-in user,
// never taken from req.body, so nobody can post a question in someone else's name
exports.create = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...pick(req.body, FIELDS), author: req.user._id });
  res.status(201).json(question);
});

// PUT /questions/:questionId
exports.update = asyncHandler(async (req, res) => {
  const question = req.question || (await findQuestionOr404(req.params.questionId));
  question.set(pick(req.body, FIELDS));
  await question.save(); // save() so validators can compare options & correctAnswerIndex
  res.json(question);
});

// DELETE /questions/:questionId
exports.remove = asyncHandler(async (req, res) => {
  const question = req.question || (await findQuestionOr404(req.params.questionId));
  await question.deleteOne();
  // keep quizzes consistent: remove the id from every quiz that references it
  await Quiz.updateMany({ questions: question._id }, { $pull: { questions: question._id } });
  res.json({ message: 'Question deleted', question });
});

exports.FIELDS = FIELDS;
