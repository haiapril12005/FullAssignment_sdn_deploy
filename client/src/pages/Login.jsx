import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login } from '../store/authSlice';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { token, user, status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Already logged in -> go to the right dashboard
  if (token && user) return <Navigate to={user.admin ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      const loggedIn = result.payload.user;
      const from = location.state && location.state.from;
      navigate(from || (loggedIn.admin ? '/admin' : '/dashboard'), { replace: true });
    }
  };

  return (
    <div className="container">
      <div className="card auth-card shadow-sm">
        <div className="card-body p-4">
          <h3 className="text-center fw-bold mb-4">Login</h3>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fs-5">
                Username
              </label>
              <input
                id="username"
                className="form-control form-control-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label fs-5">
                Password
              </label>
              <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={status === 'loading'}>
              {status === 'loading' ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/register" className="text-decoration-none fs-5">
              Don&apos;t have an account? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
