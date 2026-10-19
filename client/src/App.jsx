import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import QuizList from './pages/QuizList';
import TakeQuiz from './pages/TakeQuiz';
import AdminHome from './pages/AdminHome';
import ManageQuestions from './pages/ManageQuestions';
import ManageQuizzes from './pages/ManageQuizzes';
import NotFound from './pages/NotFound';

const userLinks = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/quiz', label: 'Quiz' },
];

const adminLinks = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/questions', label: 'Manage Questions' },
  { to: '/admin/quizzes', label: 'Manage Quizzes' },
  { to: '/dashboard/quiz', label: 'Take Quiz' },
];

// "/" -> the right home page depending on who is logged in
function HomeRedirect() {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={user && user.admin ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  // Re-check the saved token once when the app loads
  useEffect(() => {
    if (token) dispatch(fetchMe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any logged-in user: take quizzes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout title="Dashboard" links={userLinks} />}>
          <Route index element={<UserHome />} />
          <Route path="quiz" element={<QuizList />} />
          <Route path="quiz/:quizId" element={<TakeQuiz />} />
        </Route>
      </Route>

      {/* Admin only: CRUD questions and quizzes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<DashboardLayout title="Admin Dashboard" links={adminLinks} />}>
          <Route index element={<AdminHome />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="quizzes" element={<ManageQuizzes />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
