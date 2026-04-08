import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const teacherNav = [
  { path: '/teacher-dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/reviews', label: 'Reviews', icon: '📝' },
  { path: '/collaboration', label: 'Collaboration', icon: '💬' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const studentNav = [
  { path: '/student-dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/projects', label: 'My Projects', icon: '📁' },
  { path: '/reviews', label: 'Peer Reviews', icon: '📝' },
  { path: '/collaboration', label: 'Collaboration', icon: '💬' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const adminNav = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: '🛠️' },
  { path: '/projects', label: 'All Projects', icon: '📁' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const navItems = user?.role === 'teacher' ? teacherNav : user?.role === 'admin' ? adminNav : studentNav;

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">PeerCollab</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path.includes('dashboard')}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-role-badge">
            <span>{user?.role === 'teacher' ? '👩‍🏫' : user?.role === 'admin' ? '🛠️' : '🎓'}</span>
            <span className="sidebar-role-text">
              {user?.role === 'teacher' ? 'Teacher Mode' : user?.role === 'admin' ? 'Admin Mode' : 'Student Mode'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
