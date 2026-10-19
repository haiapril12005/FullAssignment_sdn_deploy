import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../store/quizSlice';
import { computeScore, restartQuiz, startQuiz, submitAnswer } from '../store/playSlice';

export default function TakeQuiz() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.quizzes);
  const play = useSelector((s) => s.play);
  const [selected, setSelected] = useState(null);

  const quiz = items.find((q) => q._id === quizId);

  // Load quizzes if the page was opened directly (e.g. after a refresh)
  useEffect(() => {
    if (status === 'idle') dispatch(fetchQuizzes());
  }, [status, dispatch]);

  // Start a fresh attempt every time a quiz is opened
  useEffect(() => {
    dispatch(startQuiz(quizId));
    setSelected(null);
  }, [quizId, dispatch]);

  if (!quiz) {
    if (status === 'loading' || status === 'idle') {
      return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>;
    }
    return (
      <div className="text-center">
        <div className="alert alert-warning">{error || 'Quiz not found.'}</div>
        <Link to="/dashboard/quiz" className="btn btn-secondary">Back to quizzes</Link>
      </div>
    );
  }

  const questions = quiz.questions;
  const total = questions.length;

  if (total === 0) {
    return (
      <div className="text-center">
        <p className="text-muted">This quiz has no questions yet.</p>
        <Link to="/dashboard/quiz" className="btn btn-secondary">Back to quizzes</Link>
      </div>
    );
  }

  /* ---------- Finished: score + review ---------- */
  if (play.quizId === quizId && play.finished) {
    const score = computeScore(questions, play.answers);
    return (
      <div className="quiz-box text-center">
        <h2 className="display-6 fw-semibold">Quiz Completed</h2>
        <p className="fs-5 mb-3">
          Your score: {score} / {total}
        </p>
        <div className="d-flex justify-content-center gap-2 mb-4">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              dispatch(restartQuiz());
              setSelected(null);
            }}
          >
            Restart Quiz
          </button>
          <Link to="/dashboard/quiz" className="btn btn-outline-secondary btn-lg">
            Other quizzes
          </Link>
        </div>

        <ul className="list-group text-start">
          {questions.map((q, i) => {
            const chosen = play.answers[i];
            const correct = chosen === q.correctAnswerIndex;
            return (
              <li key={q._id} className={`list-group-item ${correct ? 'list-group-item-success' : 'list-group-item-danger'}`}>
                <div className="fw-semibold">
                  {i + 1}. {q.text}
                </div>
                <div className="small">
                  Your answer: {q.options[chosen] !== undefined ? q.options[chosen] : '-'}
                  {!correct && <> &middot; Correct answer: {q.options[q.correctAnswerIndex]}</>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  /* ---------- One question at a time ---------- */
  const index = play.quizId === quizId ? play.currentIndex : 0;
  const question = questions[index];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected === null) return;
    dispatch(submitAnswer({ selected, total }));
    setSelected(null);
  };

  return (
    <div className="quiz-box">
      <h2 className="text-center display-6 fw-semibold">Quiz</h2>
      <p className="text-center text-muted mb-3">
        {quiz.title} &middot; Question {index + 1} of {total}
      </p>
      <div className="progress mb-4" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-bar" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <form onSubmit={handleSubmit}>
        <h3 className="mb-3">{question.text}</h3>
        {question.options.map((option, i) => (
          <div className="form-check fs-5" key={`${question._id}-${i}`}>
            <input
              className="form-check-input"
              type="radio"
              name="answer"
              id={`option-${i}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            <label className="form-check-label option-label" htmlFor={`option-${i}`}>
              {option}
            </label>
          </div>
        ))}
        <button type="submit" className="btn btn-primary btn-lg mt-4" disabled={selected === null}>
          Submit Answer
        </button>
      </form>
    </div>
  );
}
