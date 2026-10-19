const express = require('express');
const ctrl = require('../controllers/questionController');
const { verifyUser, verifyAdmin } = require('../authenticate');

const router = express.Router();

// Assignment 4: "If user is admin, user can CRUD question and other ones can only take quizzes"
//  - GET  : any logged-in user (needed to take quizzes)
//  - POST / PUT / DELETE : Admin only
const notSupported = (msg) => (req, res, next) => {
  const err = new Error(msg);
  err.status = 403;
  next(err);
};

router
  .route('/')
  .get(verifyUser, ctrl.getAll)
  .post(verifyUser, verifyAdmin, ctrl.create)
  .put(verifyUser, verifyAdmin, notSupported('PUT operation not supported on /questions'))
  .delete(verifyUser, verifyAdmin, notSupported('DELETE operation not supported on /questions'));

router
  .route('/:questionId')
  .get(verifyUser, ctrl.getOne)
  .post(verifyUser, verifyAdmin, notSupported('POST operation not supported on /questions/:questionId'))
  .put(verifyUser, verifyAdmin, ctrl.update)
  .delete(verifyUser, verifyAdmin, ctrl.remove);

module.exports = router;
