import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UserHome() {
  const user = useSelector((s) => s.auth.user);
  return (
    <div className="p-4 bg-light rounded-3">
      <h2 className="h4">Hello {user && user.username}!</h2>
      <p className="text-muted mb-3">Pick a quiz, choose your answers and see your score at the end.</p>
      <Link to="/dashboard/quiz" className="btn btn-primary">
        Go to quizzes
      </Link>
    </div>
  );
}
