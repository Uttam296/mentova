import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MentorshipRequests.css';

const MentorshipRequests = () => {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState({ rating: 5, text: '' });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${API}/mentorship/my`);
      setMentorships(res.data);
      setLoading(false);
    };
    fetch();
  }, [API]);

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API}/mentorship/${id}/status`, { status });
      setMentorships(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      showToast(`Request ${status}! ${status === 'accepted' ? '🎉' : ''}`);
    } catch { showToast('Failed to update.'); }
  };

  const submitReview = async () => {
    try {
      await axios.post(`${API}/mentorship/${reviewModal._id}/review`, { rating: review.rating, review: review.text });
      setMentorships(prev => prev.map(m => m._id === reviewModal._id ? { ...m, rating: review.rating, review: review.text } : m));
      setReviewModal(null);
      showToast('Review submitted! ⭐');
    } catch { showToast('Failed to submit review.'); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const pending = mentorships.filter(m => m.status === 'pending');
  const accepted = mentorships.filter(m => m.status === 'accepted');
  const others = mentorships.filter(m => m.status === 'rejected' || m.status === 'completed');

  const MentorshipCard = ({ ms }) => {
    const other = user?.role === 'mentor' ? ms.mentee : ms.mentor;
    return (
      <div className="mentorship-card card">
        <div className="mc-header">
          <div className="mc-user">
            <div className="avatar avatar-md">{initials(other?.name)}</div>
            <div>
              <div className="mc-name">{other?.name}</div>
              <div className="mc-meta">{other?.year} Year · {other?.department}</div>
              {other?.skills?.length > 0 && (
                <div className="mc-skills">
                  {other.skills.slice(0, 3).map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
              )}
            </div>
          </div>
          <span className={`badge badge-${ms.status}`} style={{ height: 'fit-content' }}>{ms.status}</span>
        </div>

        {ms.message && (
          <div className="mc-message">
            <div className="mc-message-label">Message:</div>
            <p>{ms.message}</p>
          </div>
        )}

        {ms.goals?.length > 0 && (
          <div className="mc-goals">
            <div className="mc-message-label">Goals:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {ms.goals.map((g, i) => <span key={i} className="goal-tag">{g}</span>)}
            </div>
          </div>
        )}

        <div className="mc-footer">
          <div className="mc-date">
            {new Date(ms.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="mc-actions">
            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/chat/${other?._id}`)}>
              💬 Message
            </button>
            {user?.role === 'mentor' && ms.status === 'pending' && (
              <>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(ms._id, 'rejected')}>Decline</button>
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(ms._id, 'accepted')}>Accept ✓</button>
              </>
            )}
            {user?.role === 'mentor' && ms.status === 'accepted' && (
              <button className="btn btn-outline btn-sm" onClick={() => updateStatus(ms._id, 'completed')}>Mark Complete</button>
            )}
            {user?.role === 'mentee' && ms.status === 'accepted' && !ms.rating && (
              <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(ms)}>⭐ Leave Review</button>
            )}
            {ms.rating && (
              <div className="mc-rating">
                {'★'.repeat(ms.rating)}{'☆'.repeat(5 - ms.rating)} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ms.review}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {user?.role === 'mentor' ? 'Mentorship Requests' : 'My Mentors'}
        </h1>
        <p className="page-subtitle">
          {user?.role === 'mentor'
            ? 'Manage requests from students seeking your guidance.'
            : 'Track your mentorship connections and progress.'}
        </p>
      </div>

      {mentorships.length === 0 ? (
        <div className="empty-page card">
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
          <h3>No mentorships yet</h3>
          <p>{user?.role === 'mentee' ? 'Browse mentors and send your first request!' : 'Your requests will appear here once students reach out.'}</p>
          {user?.role === 'mentee' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/mentors')}>
              Find Mentors →
            </button>
          )}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-title">
                <span className="ms-dot pending"></span>
                Pending ({pending.length})
              </div>
              <div className="mentorship-list">
                {pending.map(ms => <MentorshipCard key={ms._id} ms={ms} />)}
              </div>
            </div>
          )}

          {accepted.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-title">
                <span className="ms-dot accepted"></span>
                Active ({accepted.length})
              </div>
              <div className="mentorship-list">
                {accepted.map(ms => <MentorshipCard key={ms._id} ms={ms} />)}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-title">
                <span className="ms-dot others"></span>
                Past ({others.length})
              </div>
              <div className="mentorship-list">
                {others.map(ms => <MentorshipCard key={ms._id} ms={ms} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave a Review</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
                How was your experience with {user?.role === 'mentee' ? reviewModal.mentor?.name : reviewModal.mentee?.name}?
              </p>
              <div className="star-selector">
                {[1,2,3,4,5].map(s => (
                  <span
                    key={s}
                    className={`big-star ${s <= review.rating ? 'active' : ''}`}
                    onClick={() => setReview({...review, rating: s})}
                  >★</span>
                ))}
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Your review (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Share your experience..."
                  value={review.text} onChange={e => setReview({...review, text: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview}>Submit Review ⭐</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default MentorshipRequests;
