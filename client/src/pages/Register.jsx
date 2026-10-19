import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, register } from '../store/authSlice';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const { token, user, status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (token && user) return <Navigate to={user.admin ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    const result = await dispatch(register({ username, password }));
    if (register.fulfilled.match(result)) navigate('/dashboard', { replace: true });
  };

  const shownError = localError || error;

  return (
    <div className="container">
      <div className="card auth-card shadow-sm">
        <div className="card-body p-4">
          <h3 className="text-center fw-bold mb-4">Register</h3>
          {shownError && <div className="alert alert-danger py-2">{shownError}</div>}
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
                minLength={3}
                autoFocus
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fs-5">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirm" className="form-label fs-5">
                Confirm password
              </label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none fs-5">
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
