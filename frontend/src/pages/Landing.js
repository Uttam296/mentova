import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const features = [
    { icon: '🎓', title: 'Expert Mentorship', desc: 'Connect with senior students who have navigated the same challenges you face today.' },
    { icon: '📚', title: 'Resource Hub', desc: 'Access curated notes, past papers, project ideas, and career guides shared by your peers.' },
    { icon: '💬', title: 'Real-Time Chat', desc: 'Ask any doubt instantly — about academics, internships, or life choices — and get answers fast.' },
    { icon: '🗺️', title: 'Career Guidance', desc: 'Get firsthand advice on placements, higher studies, certifications, and industry insights.' },
  ];

  const stats = [
    { value: '500+', label: 'Active Mentors' },
    { value: '2,000+', label: 'Students Helped' },
    { value: '5,000+', label: 'Resources Shared' },
    { value: '10,000+', label: 'Messages Sent' },
  ];

  return (
    <div className="landing">
      {/* HERO */}
      <header className="landing-header">
        <div className="header-inner">
          <div className="brand-pill">
            <span>⚡</span> Mentova
          </div>
          <div className="header-actions">
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-blob blob-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">🎓 Junior–Senior Knowledge Bridge</div>
          <h1 className="hero-title">
            Learn from those<br />who walked<br />
            <span className="hero-highlight">your path</span>
          </h1>
          <p className="hero-subtitle">
            Mentova bridges the gap between junior and senior students through mentorship, 
            resource sharing, and real-time guidance.
          </p>
          <div className="hero-cta">
            <Link to="/register?role=mentee" className="btn btn-primary btn-lg">
              Find a Mentor →
            </Link>
            <Link to="/register?role=mentor" className="btn btn-outline btn-lg">
              Become a Mentor
            </Link>
          </div>
          <div className="hero-note">
            Free to join · No experience required · 500+ mentors waiting
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card card1">
            <div className="hc-avatar mentor-av">SK</div>
            <div>
              <div className="hc-name">Sneha Kumar</div>
              <div className="hc-role">4th Year · CSE · Mentor</div>
            </div>
            <div className="hc-badge">⭐ 4.9</div>
          </div>
          <div className="hero-card card2">
            <div className="msg-bubble">What internships should I target in 2nd year?</div>
            <div className="msg-bubble reply">Start with dev internships on Internshala, build 2 solid GitHub projects first!</div>
          </div>
          <div className="hero-card card3">
            <div className="res-icon">📄</div>
            <div>
              <div className="hc-name">DSA Cheat Sheet</div>
              <div className="hc-role">Shared by Rahul M. · 234 downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-eyebrow">What you get</div>
          <h2 className="section-title">Everything you need to thrive in college</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-inner">
          <div className="section-eyebrow">Simple process</div>
          <h2 className="section-title">Up and running in minutes</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <h4>Sign up as Mentor or Mentee</h4>
                <p>Create your profile with your year, department, and interests.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                <h4>Browse & Connect</h4>
                <p>Explore mentor profiles and send a connection request.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                <h4>Learn & Grow</h4>
                <p>Chat, share resources, and build your academic journey together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to bridge the gap?</h2>
          <p>Join thousands of students already on Mentova.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)' }}>
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="brand-pill" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            ⚡ Mentova
          </div>
          <p>Bridging juniors and seniors · Built with ❤️ for students</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
