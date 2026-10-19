const express = require('express');
const ctrl = require('../controllers/quizController');
const { verifyUser, verifyAdmin } = require('../authenticate');

const router = express.Router();

// The frontend must log in BEFORE fetching quizzes, so every route needs verifyUser.
// Creating / updating / deleting quizzes is Admin only.
const notSupported = (msg) => (req, res, next) => {
  const err = new Error(msg);
  err.status = 403;
  next(err);
};

router
  .route('/')
  .get(verifyUser, ctrl.getAll)
  .post(verifyUser, verifyAdmin, ctrl.create)
  .put(verifyUser, verifyAdmin, notSupported('PUT operation not supported on /quizzes'))
  .delete(verifyUser, verifyAdmin, ctrl.removeAll);

router.get('/:quizId/populate', verifyUser, ctrl.populateCapital);
router.post('/:quizId/question', verifyUser, verifyAdmin, ctrl.addQuestion);
router.post('/:quizId/questions', verifyUser, verifyAdmin, ctrl.addQuestions);

router
  .route('/:quizId')
  .get(verifyUser, ctrl.getOne)
  .post(verifyUser, verifyAdmin, notSupported('POST operation not supported on /quizzes/:quizId'))
  .put(verifyUser, verifyAdmin, ctrl.update)
  .delete(verifyUser, verifyAdmin, ctrl.remove);

module.exports = router;
