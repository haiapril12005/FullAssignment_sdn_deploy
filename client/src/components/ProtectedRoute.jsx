import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Not logged in -> /login.  adminOnly and not admin -> /dashboard.
export default function ProtectedRoute({ adminOnly = false }) {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && !user.admin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
