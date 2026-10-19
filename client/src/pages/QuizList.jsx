import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../store/quizSlice';

export default function QuizList() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  if (status === 'loading' && items.length === 0) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>;
  }

  return (
    <div>
      <h2 className="text-center mb-4">Quizzes</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {status === 'succeeded' && items.length === 0 && <p className="text-muted text-center">No quizzes yet.</p>}
      <div className="row g-3">
        {items.map((quiz) => (
          <div className="col-md-6 col-lg-4" key={quiz._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{quiz.title}</h5>
                <p className="card-text text-muted flex-grow-1">{quiz.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge text-bg-secondary">{quiz.questions.length} questions</span>
                  {quiz.questions.length > 0 ? (
                    <Link to={`/dashboard/quiz/${quiz._id}`} className="btn btn-primary">
                      Start Quiz
                    </Link>
                  ) : (
                    <button type="button" className="btn btn-secondary" disabled>
                      No questions
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
