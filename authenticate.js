const User = require('./models/User');
const Question = require('./models/Question');
const { sign, verify } = require('./utils/authToken');

/**
 * Generate a JWT token for the given user.
 */
exports.getToken = function (user) {
  const payload = {
    sub: user._id.toString(),
    _id: user._id.toString(),
    username: user.username,
    admin: !!user.admin,
    exp: Math.floor(Date.now() / 1000) + 3600 * 24, // 24 hours
  };
  return sign(payload);
};

/**
 * Middleware: Verify that the request has a valid JWT token.
 * Attaches authenticated user object to req.user.
 */
exports.verifyUser = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.get('authorization') || req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      } else if (parts.length === 1) {
        token = parts[0];
      }
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }

    const payload = verify(token);
    if (!payload || (!payload.sub && !payload._id)) {
      const err = new Error('Invalid or expired token');
      err.status = 401;
      return next(err);
    }

    const userId = payload.sub || payload._id;
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Verify that req.user has administrator privileges.
 */
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    return next();
  }
  const err = new Error('You are not authorized to perform this operation!');
  err.status = 403;
  return next(err);
};

/**
 * Middleware: Verify that req.user is the author of the question specified by req.params.questionId.
 */
exports.verifyAuthor = async (req, res, next) => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) {
      const err = new Error('Question ID parameter missing');
      err.status = 400;
      return next(err);
    }

    const question = await Question.findById(questionId);
    if (!question) {
      const err = new Error('Question not found');
      err.status = 404;
      return next(err);
    }

    if (
      !req.user ||
      !question.author ||
      question.author.toString() !== req.user._id.toString()
    ) {
      const err = new Error('You are not the author of this question');
      err.status = 403;
      return next(err);
    }

    req.question = question;
    next();
  } catch (err) {
    next(err);
  }
};
