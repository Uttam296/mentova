import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon-lg">⚡</span>
          <h1>Mentova</h1>
          <p>Where knowledge flows from senior to junior, and mentorship becomes friendship.</p>
        </div>
        <div className="auth-quote">
          <blockquote>"The best investment you can make is in your own education."</blockquote>
          <cite>— Warren Buffett</cite>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to your Mentova account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" className="form-control" placeholder="you@college.edu"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" className="form-control" placeholder="Your password"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>Demo Accounts</span></div>
          <div className="demo-accounts">
            <div className="demo-item">
              <strong>Mentor:</strong> mentor@demo.com / demo1234
            </div>
            <div className="demo-item">
              <strong>Mentee:</strong> mentee@demo.com / demo1234
            </div>
          </div>

          <p className="auth-switch">
            New to Mentova? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
