import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { path: '/mentors', label: 'Mentors', icon: '★' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/chat', label: 'Messages', icon: '💬' },
    { path: '/mentorships', label: user?.role === 'mentor' ? 'Requests' : 'My Mentors', icon: '🤝' },
    { path: '/ai-mentor', label: 'AI Mentor', icon: '🤖', highlight: true },
  ];

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">Mentova</span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''} ${link.highlight ? 'nav-link-ai' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
              {link.highlight && <span className="nav-new-badge">NEW</span>}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <Link to="/profile" className="nav-avatar-btn">
            <div className="avatar avatar-sm">{initials}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
              <span className={`badge ${user?.role === 'mentor' ? 'badge-mentor' : 'badge-mentee'}`}>
                {user?.role}
              </span>
            </div>
          </Link>
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
