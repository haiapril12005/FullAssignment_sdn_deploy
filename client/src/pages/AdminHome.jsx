import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../store/questionSlice';
import { fetchQuizzes } from '../store/quizSlice';

export default function AdminHome() {
  const dispatch = useDispatch();
  const questionCount = useSelector((s) => s.questions.items.length);
  const quizCount = useSelector((s) => s.quizzes.items.length);

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Questions</h5>
            <p className="display-6 mb-3">{questionCount}</p>
            <Link to="/admin/questions" className="btn btn-primary">
              Manage Questions
            </Link>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Quizzes</h5>
            <p className="display-6 mb-3">{quizCount}</p>
            <Link to="/admin/quizzes" className="btn btn-primary">
              Manage Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
