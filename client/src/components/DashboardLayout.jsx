import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

// Header ("Dashboard" / "Admin Dashboard" + "Welcome, <name>") and the navigation bar
export default function DashboardLayout({ title, links }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="display-5 fw-semibold mb-0">{title}</h1>
        <span className="fs-5">
          Welcome, {user && user.username}
          {user && user.admin && <span className="badge bg-danger ms-2 fs-6 align-middle">Admin</span>}
        </span>
      </div>

      <nav className="navbar navbar-expand bg-body-tertiary rounded px-4 mb-4">
        <ul className="navbar-nav flex-wrap">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink to={link.to} end={link.end} className="nav-link">
                {link.label}
              </NavLink>
            </li>
          ))}
          {user && user.admin && !links.some((l) => l.to === '/admin') && (
            <li className="nav-item">
              <NavLink to="/admin" className="nav-link">
                Admin Panel
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <button type="button" className="nav-link btn btn-link" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
