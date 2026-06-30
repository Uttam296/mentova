import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, API } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [resources, setResources] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, r, ms] = await Promise.all([
          axios.get(`${API}/users/mentors`),
          axios.get(`${API}/resources`),
          axios.get(`${API}/mentorship/my`)
        ]);
        setMentors(m.data.slice(0, 4));
        setResources(r.data.slice(0, 4));
        setMentorships(ms.data.slice(0, 3));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [API]);

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const stars = (rating) => '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));

  const quickStats = user?.role === 'mentor'
    ? [
        { label: 'Active Mentees', value: mentorships.filter(m => m.status === 'accepted').length, icon: '👥', color: 'var(--primary)' },
        { label: 'Pending Requests', value: mentorships.filter(m => m.status === 'pending').length, icon: '⏳', color: 'var(--gold)' },
        { label: 'Your Rating', value: user.rating ? user.rating.toFixed(1) + '⭐' : 'N/A', icon: '🏆', color: 'var(--secondary)' },
        { label: 'Resources Shared', value: resources.filter(r => r.uploadedBy?._id === user._id).length, icon: '📚', color: 'var(--accent)' },
      ]
    : [
        { label: 'My Mentors', value: mentorships.filter(m => m.status === 'accepted').length, icon: '🎓', color: 'var(--primary)' },
        { label: 'Pending Requests', value: mentorships.filter(m => m.status === 'pending').length, icon: '⏳', color: 'var(--gold)' },
        { label: 'Available Mentors', value: mentors.length, icon: '👤', color: 'var(--accent)' },
        { label: 'Resources', value: resources.length, icon: '📚', color: 'var(--secondary)' },
      ];

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div className="welcome-left">
          <div className="welcome-avatar avatar avatar-lg">{initials(user?.name)}</div>
          <div>
            <h1 className="welcome-title">Good to see you, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="welcome-sub">
              {user?.year} Year · {user?.department} ·
              <span className={`badge ${user?.role === 'mentor' ? 'badge-mentor' : 'badge-mentee'}`} style={{ marginLeft: 8 }}>
                {user?.role}
              </span>
            </p>
          </div>
        </div>
        <div className="welcome-actions">
          {user?.role === 'mentee' && (
            <Link to="/mentors" className="btn btn-primary">Find a Mentor →</Link>
          )}
          <Link to="/resources" className="btn btn-secondary">Browse Resources</Link>
          <Link to="/chat" className="btn btn-outline">💬 Messages</Link>
        </div>
      </div>

      {/* AI Mentor Banner */}
      <div className="ai-banner">
        <div className="ai-banner-left">
          <div className="ai-banner-icon">🤖</div>
          <div>
            <div className="ai-banner-title">Meet your AI Mentor — available 24/7</div>
            <div className="ai-banner-sub">Ask about DSA, internships, career paths, resume tips, and anything college. Powered by Claude AI.</div>
          </div>
        </div>
        <Link to="/ai-mentor" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>
          Chat Now →
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        {quickStats.map((stat, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Mentors Section */}
        <div className="dash-section">
          <div className="section-header">
            <h3>Top Mentors</h3>
            <Link to="/mentors" className="see-all">See all →</Link>
          </div>
          <div className="mentor-list">
            {mentors.length === 0 ? (
              <div className="empty-state">No mentors yet.</div>
            ) : mentors.map(m => (
              <div key={m._id} className="mentor-mini card card-hover">
                <div className="avatar avatar-sm">{initials(m.name)}</div>
                <div className="mentor-mini-info">
                  <strong>{m.name}</strong>
                  <span>{m.year} · {m.department}</span>
                </div>
                <div className="mentor-mini-right">
                  <div className="mini-rating" title={`${m.rating?.toFixed(1)} / 5`}>
                    {stars(m.rating)}
                  </div>
                  {m.isAvailable && <span className="avail-dot">●</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="dash-section">
          <div className="section-header">
            <h3>Recent Resources</h3>
            <Link to="/resources" className="see-all">See all →</Link>
          </div>
          <div className="resource-list">
            {resources.length === 0 ? (
              <div className="empty-state">No resources yet.</div>
            ) : resources.map(r => (
              <div key={r._id} className="resource-mini card card-hover">
                <div className="res-cat-badge" style={{ background: getCatColor(r.category) }}>
                  {getCatIcon(r.category)}
                </div>
                <div className="res-mini-info">
                  <strong>{r.title}</strong>
                  <span>{r.subject} · {r.category}</span>
                </div>
                <div className="res-likes">❤️ {r.likes?.length || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorships */}
        <div className="dash-section">
          <div className="section-header">
            <h3>{user?.role === 'mentor' ? 'Recent Requests' : 'My Mentors'}</h3>
            <Link to="/mentorships" className="see-all">See all →</Link>
          </div>
          {mentorships.length === 0 ? (
            <div className="empty-card card">
              <div className="empty-icon">🤝</div>
              <p>
                {user?.role === 'mentee'
                  ? 'No mentors yet. Browse and connect!'
                  : 'No mentorship requests yet.'}
              </p>
              {user?.role === 'mentee' && (
                <Link to="/mentors" className="btn btn-primary" style={{ marginTop: 12 }}>Find Mentors</Link>
              )}
            </div>
          ) : mentorships.map(ms => {
            const other = user?.role === 'mentor' ? ms.mentee : ms.mentor;
            return (
              <div key={ms._id} className="mentorship-mini card">
                <div className="avatar avatar-sm">{initials(other?.name)}</div>
                <div style={{ flex: 1 }}>
                  <strong>{other?.name}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{other?.department} · {other?.year}</div>
                </div>
                <span className={`badge badge-${ms.status}`}>{ms.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getCatIcon = (cat) => {
  const map = { Notes: '📝', 'Past Papers': '📋', Books: '📗', Videos: '🎬', Career: '💼', Research: '🔬', Projects: '🛠️', Other: '📦' };
  return map[cat] || '📦';
};
const getCatColor = (cat) => {
  const map = { Notes: '#EEF0FF', 'Past Papers': '#FFF6E0', Books: '#E0FBF4', Videos: '#FEE2E2', Career: '#F3F4F6', Research: '#EDE9FE' };
  return map[cat] || '#F3F4F6';
};

export default Dashboard;
