import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Resources.css';

const CATEGORIES = ['All', 'Notes', 'Past Papers', 'Books', 'Videos', 'Career', 'Research', 'Projects', 'Other'];
const CAT_ICONS = { Notes: '📝', 'Past Papers': '📋', Books: '📗', Videos: '🎬', Career: '💼', Research: '🔬', Projects: '🛠️', Other: '📦' };
const CAT_COLORS = { Notes: '#EEF0FF', 'Past Papers': '#FFF6E0', Books: '#E0FBF4', Videos: '#FEE2E2', Career: '#F3F4F6', Research: '#EDE9FE', Projects: '#FEE2E2', Other: '#F3F4F6' };

const Resources = () => {
  const { user, API } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Notes', subject: '', externalLink: '', tags: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchResources(); }, [category, API]);

  const fetchResources = async () => {
    const params = {};
    if (category !== 'All') params.category = category;
    const res = await axios.get(`${API}/resources`, { params });
    setResources(res.data);
    setLoading(false);
  };

  const filtered = resources.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await axios.post(`${API}/resources`, { ...form, tags: tagsArr });
      setResources(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'Notes', subject: '', externalLink: '', tags: '', department: '' });
      showToast('Resource shared! 🎉');
    } catch (err) {
      showToast('Failed to share resource');
    }
    setSubmitting(false);
  };

  const handleLike = async (id) => {
    try {
      const res = await axios.post(`${API}/resources/${id}/like`);
      setResources(prev => prev.map(r => r._id === id ? { ...r, likes: Array(res.data.likes).fill(null) } : r));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await axios.delete(`${API}/resources/${id}`);
    setResources(prev => prev.filter(r => r._id !== id));
    showToast('Deleted.');
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Resource Hub</h1>
          <p className="page-subtitle">Shared by seniors, curated for success. Browse notes, past papers, career tips, and more.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Share Resource'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="resource-form card" style={{ marginBottom: 28 }}>
          <h3 style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Share a Resource</h3>
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" placeholder="DSA Interview Questions"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" className="form-control" placeholder="Data Structures"
                  value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} placeholder="What is this resource about? Who would benefit?"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department (optional)</label>
                <input type="text" className="form-control" placeholder="CSE / All"
                  value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>External Link (Google Drive, YouTube, etc.)</label>
              <input type="url" className="form-control" placeholder="https://drive.google.com/..."
                value={form.externalLink} onChange={e => setForm({...form, externalLink: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" className="form-control" placeholder="dsa, algorithm, interview"
                value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sharing...' : 'Share Resource 🚀'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="resource-filters">
        <input type="text" className="form-control" placeholder="🔍 Search resources..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <div className="cat-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`cat-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c !== 'All' && CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      <div className="resources-count">{filtered.length} resource{filtered.length !== 1 ? 's' : ''}</div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : (
        <div className="resources-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No resources found. Be the first to share!
            </div>
          ) : filtered.map(r => (
            <div key={r._id} className="resource-card card card-hover">
              <div className="resource-card-header" style={{ background: CAT_COLORS[r.category] || '#F3F4F6' }}>
                <div className="resource-cat-icon">{CAT_ICONS[r.category] || '📦'}</div>
                <div className="resource-meta-right">
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.8)', color: 'var(--text)' }}>{r.category}</span>
                  {r.uploadedBy?._id === user?._id && (
                    <button className="delete-btn" onClick={() => handleDelete(r._id)}>🗑</button>
                  )}
                </div>
              </div>
              <div className="resource-card-body">
                <h4>{r.title}</h4>
                <div className="resource-subject">{r.subject} {r.department ? `· ${r.department}` : ''}</div>
                <p className="resource-desc">{r.description.slice(0, 120)}{r.description.length > 120 ? '...' : ''}</p>
                {r.tags?.length > 0 && (
                  <div className="resource-tags">
                    {r.tags.slice(0, 3).map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="resource-card-footer">
                <div className="uploader-info">
                  <div className="avatar avatar-sm">{initials(r.uploadedBy?.name)}</div>
                  <div>
                    <div className="uploader-name">{r.uploadedBy?.name || 'Anonymous'}</div>
                    <div className="uploader-role">{r.uploadedBy?.role} · {r.uploadedBy?.year}</div>
                  </div>
                </div>
                <div className="resource-actions">
                  <button className="like-btn" onClick={() => handleLike(r._id)}>
                    ❤️ {r.likes?.length || 0}
                  </button>
                  {r.externalLink && (
                    <a href={r.externalLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      Open ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Resources;
