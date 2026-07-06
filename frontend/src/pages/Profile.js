import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT', 'MBA', 'BCA', 'MCA', 'Physics', 'Chemistry', 'Mathematics', 'Other'];
const ALL_SKILLS = ['DSA', 'Web Dev', 'Machine Learning', 'App Dev', 'Cloud', 'Cybersecurity', 'Data Science', 'UI/UX', 'Research', 'Communication', 'Leadership', 'Python', 'Java', 'C++', 'React', 'Node.js'];

const Profile = () => {
  const { user, updateUser, API } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    department: user?.department || '',
    year: user?.year || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    isAvailable: user?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/users/profile`, form);
      updateUser(res.data);
      setEditing(false);
      showToast('Profile updated! ✅');
    } catch { showToast('Failed to update profile.'); }
    setSaving(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const starRender = (r) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(r || 0) ? 'var(--gold)' : 'var(--border)', fontSize: 18 }}>★</span>
  ));

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="profile-hero card">
        <div className="profile-cover"></div>
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="avatar avatar-xl profile-avatar">{initials}</div>
            {user?.isAvailable && <div className="avail-indicator" title="Available for mentorship"></div>}
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1>{user?.name}</h1>
              <span className={`badge ${user?.role === 'mentor' ? 'badge-mentor' : 'badge-mentee'}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                {user?.role === 'mentor' ? '🎓 Mentor' : '📖 Mentee'}
              </span>
            </div>
            <div className="profile-meta">
              📍 {user?.year} Year · {user?.department}
            </div>
            {user?.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                {starRender(user.rating)}
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.rating.toFixed(1)} ({user.reviewCount} reviews)</span>
              </div>
            )}
            {user?.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
          <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Social links */}
        {(user?.linkedIn || user?.github) && (
          <div className="profile-links">
            {user.linkedIn && (
              <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" className="social-link">
                💼 LinkedIn
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" className="social-link">
                🐙 GitHub
              </a>
            )}
          </div>
        )}
      </div>

      {/* Skills section */}
      {!editing && user?.skills?.length > 0 && (
        <div className="card profile-section">
          <h3 className="section-title-sm">Skills & Expertise</h3>
          <div className="skills-display">
            {user.skills.map((s, i) => (
              <span key={i} className="skill-tag">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="card profile-section">
          <h3 className="section-title-sm">Edit Profile</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-control" value={form.department}
                onChange={e => setForm({...form, department: e.target.value})}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Year</label>
              <select className="form-control" value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}>
                {['1st', '2nd', '3rd', '4th'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            {user?.role === 'mentor' && (
              <div className="form-group">
                <label>Availability</label>
                <select className="form-control" value={form.isAvailable ? 'available' : 'busy'}
                  onChange={e => setForm({...form, isAvailable: e.target.value === 'available'})}>
                  <option value="available">Available for Mentorship</option>
                  <option value="busy">Currently Busy</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea className="form-control" rows={4}
              placeholder="Tell others about yourself, your interests, and what you can help with..."
              value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input type="url" className="form-control" placeholder="https://linkedin.com/in/yourname"
                value={form.linkedIn} onChange={e => setForm({...form, linkedIn: e.target.value})} />
            </div>
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="url" className="form-control" placeholder="https://github.com/yourusername"
                value={form.github} onChange={e => setForm({...form, github: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Skills (click to toggle)</label>
            <div className="skills-grid-edit">
              {ALL_SKILLS.map(skill => (
                <div key={skill}
                  className={`skill-chip-edit ${form.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes ✅'}
            </button>
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="card profile-section">
        <h3 className="section-title-sm">Account Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role</span>
            <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">{new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value">
              {user?.isAvailable
                ? <span style={{ color: '#059669' }}>● Available</span>
                : <span style={{ color: 'var(--text-muted)' }}>○ Busy</span>}
            </span>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Profile;
