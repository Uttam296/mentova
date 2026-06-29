import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Mentors.css';

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT', 'MBA', 'BCA', 'MCA'];

const Mentors = () => {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [requesting, setRequesting] = useState('');
  const [requestModal, setRequestModal] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${API}/users/mentors`);
      setMentors(res.data);
      setLoading(false);
    };
    fetch();
  }, [API]);

  const filtered = mentors.filter(m => {
    const deptOk = filter === 'All' || m.department === filter;
    const searchOk = !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    return deptOk && searchOk;
  });

  const handleRequest = async () => {
    setRequesting(requestModal._id);
    try {
      await axios.post(`${API}/mentorship/request`, {
        mentorId: requestModal._id, message: requestMsg, goals: []
      });
      showToast('Request sent! 🎉');
      setRequestModal(null); setRequestMsg('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request');
    }
    setRequesting('');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const starRender = (r) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`star ${i < Math.round(r || 0) ? 'star-filled' : 'star-empty'}`}>★</span>
  ));

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Find Your Mentor</h1>
        <p className="page-subtitle">Connect with experienced seniors who can guide your academic and career journey.</p>
      </div>

      {/* Filters */}
      <div className="mentors-filter">
        <input
          type="text" className="form-control" placeholder="🔍 Search by name, skill, or department..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <div className="dept-tabs">
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              className={`dept-tab ${filter === d ? 'active' : ''}`}
              onClick={() => setFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mentors-count">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found</div>

      <div className="mentors-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No mentors match your search. Try different filters.
          </div>
        ) : filtered.map(m => (
          <div key={m._id} className="mentor-card card card-hover">
            <div className="mentor-card-top">
              <div className="avatar avatar-lg">{initials(m.name)}</div>
              <div className="mentor-avail">
                {m.isAvailable ? <span className="avail-badge">● Available</span> : <span className="busy-badge">○ Busy</span>}
              </div>
            </div>
            <div className="mentor-card-body">
              <h3>{m.name}</h3>
              <p className="mentor-meta">{m.year} Year · {m.department}</p>
              {m.rating > 0 && (
                <div className="stars">{starRender(m.rating)} <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>({m.reviewCount})</span></div>
              )}
              {m.bio && <p className="mentor-bio">{m.bio.slice(0, 100)}{m.bio.length > 100 ? '...' : ''}</p>}
              {m.skills?.length > 0 && (
                <div className="mentor-skills">
                  {m.skills.slice(0, 4).map((s, i) => <span key={i} className="tag">{s}</span>)}
                  {m.skills.length > 4 && <span className="tag">+{m.skills.length - 4}</span>}
                </div>
              )}
            </div>
            <div className="mentor-card-footer">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/chat/${m._id}`)}
              >
                💬 Message
              </button>
              {user?.role === 'mentee' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setRequestModal(m)}
                  disabled={!m.isAvailable}
                >
                  {m.isAvailable ? '🤝 Request' : 'Unavailable'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Request Modal */}
      {requestModal && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Mentorship</h3>
              <button className="modal-close" onClick={() => setRequestModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="mentor-mini-preview">
                <div className="avatar avatar-md">{initials(requestModal.name)}</div>
                <div>
                  <strong>{requestModal.name}</strong>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{requestModal.year} · {requestModal.department}</div>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Introduce yourself and share your goals</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Hi! I'm a 2nd year CSE student looking for guidance on DSA and placements..."
                  value={requestMsg}
                  onChange={e => setRequestMsg(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRequestModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRequest} disabled={!!requesting}>
                {requesting ? 'Sending...' : 'Send Request 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Mentors;
