import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AIMentor.css';

const TOPIC_SUGGESTIONS = [
  { icon: '📚', label: 'Study Tips', prompt: 'Give me effective study techniques for college exams and how to retain information better.' },
  { icon: '💼', label: 'Internship Hunt', prompt: 'How do I find and land my first internship as a college student? What platforms should I use?' },
  { icon: '🧑‍💻', label: 'DSA Roadmap', prompt: 'Create a complete DSA learning roadmap for me to crack coding interviews. Include resources.' },
  { icon: '🚀', label: 'Career Path', prompt: 'Help me figure out which tech career path suits me — web dev, ML, cloud, cybersecurity, etc.' },
  { icon: '📝', label: 'Resume Review', prompt: 'What should a strong college student resume look like? What sections are most important for tech jobs?' },
  { icon: '🎓', label: 'Higher Studies', prompt: 'Should I pursue a Masters (MS/MTech) or go for a job after graduation? Pros, cons, and how to decide.' },
  { icon: '🤝', label: 'Networking', prompt: 'How do I build a professional network as a college student? LinkedIn tips and strategies.' },
  { icon: '⚖️', label: 'Work-Life Balance', prompt: 'How do I balance academics, coding practice, projects, and personal life in college?' },
  { icon: '🛠️', label: 'Projects for Resume', prompt: 'What kind of projects should I build to impress interviewers? Give me 5 impressive project ideas.' },
  { icon: '💰', label: 'Salary & Growth', prompt: 'What salary should I expect as a fresher in India? How do I negotiate my first job offer?' },
  { icon: '🌐', label: 'Open Source', prompt: 'How do I get started with open source contributions as a beginner? Which projects are good for beginners?' },
  { icon: '😰', label: 'Interview Anxiety', prompt: 'I get very anxious during coding interviews. How do I manage anxiety and perform better under pressure?' },
];

const PERSONALITIES = [
  { id: 'friendly', label: '😊 Friendly Senior', desc: 'Warm, encouraging, like a helpful friend' },
  { id: 'strict', label: '🎯 Strict Coach', desc: 'Direct, no-nonsense, push you to do better' },
  { id: 'funny', label: '😄 Funny & Chill', desc: 'Makes learning fun with humor and examples' },
  { id: 'professional', label: '💼 Professional', desc: 'Formal, industry-focused advice' },
];

const getSystemPrompt = (user, personality) => {
  const personalityMap = {
    friendly: "You are a warm, encouraging senior college student mentor. Speak like a helpful older friend — supportive, empathetic, and always positive. Use encouraging phrases.",
    strict: "You are a strict but fair mentor. Be direct and push the student to work harder. No sugarcoating. Give tough love but always with the student's best interest at heart.",
    funny: "You are a fun, chill mentor who makes learning enjoyable. Use humor, relatable examples, memes references, and keep things light while still being genuinely helpful.",
    professional: "You are a professional career mentor with industry experience. Give formal, structured, data-driven advice. Use bullet points and frameworks when helpful.",
  };

  return `${personalityMap[personality] || personalityMap.friendly}

You are an AI mentor inside Mentova, a college mentorship platform. You are helping a student named ${user?.name || 'the student'} who is in their ${user?.year || ''} year studying ${user?.department || 'engineering'}.

Your role: Be their personal senior mentor. Help them with:
- Academic guidance (studying, exams, CGPA strategies)
- Career planning (jobs, internships, higher studies)
- Technical skills (DSA, web dev, projects, open source)
- College life (time management, stress, networking)
- Resume and interview preparation
- Any personal academic doubts

Rules:
- Keep responses conversational and practical, not textbook-like
- Give specific, actionable advice — not vague suggestions
- Use emojis occasionally to make responses feel human (not excessively)
- If asked about specific Indian colleges, companies (TCS, Infosys, etc.) or Indian entrance exams, give India-specific advice
- Format longer answers with clear sections or bullet points for readability
- Always end with 1 follow-up question or encouragement to keep the conversation going
- Never say you're an AI unless directly asked. Stay in mentor character.`;
};

const AIMentor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState('friendly');
  const [showPersonalities, setShowPersonalities] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (content = input) => {
    const text = content.trim();
    if (!text || loading) return;

    setInput('');
    setShowTopics(false);
    setError('');

    const userMsg = { role: 'user', content: text, id: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          system: getSystemPrompt(user, personality),
          messages: apiMessages,
          personality,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'API error');
      }

      const data = await response.json();
      const assistantText = data.content?.map(b => b.text || '').join('') || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantText,
        id: Date.now() + 1,
      }]);
    } catch (err) {
      console.error(err);
      setError('Could not reach the AI. Please check your API key or try again.');
      setMessages(prev => prev.slice(0, -1)); // remove user msg on error
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    setShowTopics(true);
    setError('');
  };

  const formatMessage = (text) => {
    // Convert markdown-like formatting to JSX
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} className="ai-heading3">{line.slice(4)}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} className="ai-heading2">{line.slice(3)}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="ai-heading1">{line.slice(2)}</h2>;
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} className="ai-bullet">• {line.slice(2)}</div>;
      if (line.match(/^\d+\. /)) return <div key={i} className="ai-numbered">{line}</div>;
      if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="ai-bold-line">{line.slice(2, -2)}</strong>;
      if (line === '') return <div key={i} className="ai-spacer"></div>;
      // Inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="ai-para">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  const currentPersonality = PERSONALITIES.find(p => p.id === personality);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="ai-page">
      {/* Left Panel */}
      <div className="ai-sidebar">
        <div className="ai-sidebar-header">
          <div className="ai-avatar-wrap">
            <div className="ai-avatar">🤖</div>
            <div className="ai-status-dot"></div>
          </div>
          <div>
            <div className="ai-name">Mentova AI</div>
            <div className="ai-subtitle">Your Personal Mentor</div>
          </div>
        </div>

        <div className="ai-personality-section">
          <div className="ai-section-label">Mentor Personality</div>
          <div className="personality-grid">
            {PERSONALITIES.map(p => (
              <button
                key={p.id}
                className={`personality-btn ${personality === p.id ? 'active' : ''}`}
                onClick={() => { setPersonality(p.id); clearChat(); }}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="personality-desc">{currentPersonality?.desc}</div>
        </div>

        <div className="ai-topics-section">
          <div className="ai-section-label">Quick Topics</div>
          <div className="topics-list">
            {TOPIC_SUGGESTIONS.map((t, i) => (
              <button
                key={i}
                className="topic-btn"
                onClick={() => sendMessage(t.prompt)}
                disabled={loading}
              >
                <span className="topic-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-sidebar-footer">
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={clearChat}>
            🔄 New Conversation
          </button>
          <div className="ai-model-info">Powered by Llama 3.3 (Groq)</div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="ai-main">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-header-avatar">🤖</div>
            <div>
              <div className="ai-header-name">Mentova AI Mentor</div>
              <div className="ai-header-status">
                <span className="online-dot"></span>
                {loading ? 'Thinking...' : 'Online · Ready to help'}
              </div>
            </div>
          </div>
          <div className="ai-header-right">
            <div className="personality-badge">{currentPersonality?.label}</div>
            {messages.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={clearChat}>Clear</button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="ai-messages">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="ai-welcome">
              <div className="welcome-glow"></div>
              <div className="welcome-emoji">🎓</div>
              <h2>Hey {user?.name?.split(' ')[0]}! I'm your AI Mentor</h2>
              <p>
                I'm here to guide you through academics, career choices, internships,
                technical skills, and everything college throws at you.
                Ask me anything — no question is too small!
              </p>
              <div className="welcome-tags">
                <span>📚 Academics</span>
                <span>💼 Career</span>
                <span>🧑‍💻 Tech Skills</span>
                <span>🎯 Placements</span>
                <span>🌟 Personal Growth</span>
              </div>

              {showTopics && (
                <div className="welcome-topics">
                  <div className="welcome-topics-label">Or pick a topic to start:</div>
                  <div className="welcome-topics-grid">
                    {TOPIC_SUGGESTIONS.slice(0, 6).map((t, i) => (
                      <button
                        key={i}
                        className="welcome-topic-card"
                        onClick={() => sendMessage(t.prompt)}
                      >
                        <span className="wtc-icon">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-msg-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}>
              {msg.role === 'assistant' && (
                <div className="ai-msg-avatar">🤖</div>
              )}
              <div className={`ai-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                {msg.role === 'assistant' ? (
                  <div className="ai-formatted">{formatMessage(msg.content)}</div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="user-msg-avatar avatar avatar-sm">{initials}</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="ai-msg-row assistant-row">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-bubble assistant-bubble typing-bubble">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="typing-label">AI is thinking...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="ai-error">
              ⚠️ {error}
              <br />
              <small>Make sure your Groq API key is configured in the backend.</small>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Follow-up suggestions after response */}
        {messages.length > 0 && !loading && (
          <div className="followup-row">
            {getFollowups(messages[messages.length - 1]?.content).map((f, i) => (
              <button key={i} className="followup-chip" onClick={() => sendMessage(f)}>
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="ai-input-area">
          <div className="ai-input-box">
            <textarea
              ref={inputRef}
              className="ai-input"
              placeholder="Ask anything — study tips, career advice, coding help, or just vent about college life..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className={`ai-send-btn ${input.trim() ? 'active' : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          <div className="ai-input-hint">
            Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
            · {messages.length} message{messages.length !== 1 ? 's' : ''} in this session
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate contextual follow-up suggestions based on last AI response
const getFollowups = (lastMsg) => {
  if (!lastMsg) return [];
  const msg = lastMsg.toLowerCase();
  if (msg.includes('internship') || msg.includes('intern')) return ['Which companies hire freshers?', 'How to write a cold email?', 'What skills do I need?'];
  if (msg.includes('dsa') || msg.includes('algorithm') || msg.includes('data structure')) return ['Best DSA resources?', 'How long will it take?', 'Give me a practice problem'];
  if (msg.includes('resume')) return ['Can you review my resume?', 'What projects should I add?', 'How long should it be?'];
  if (msg.includes('career') || msg.includes('job')) return ['What is the average salary?', 'Which companies are best?', 'How to prepare?'];
  if (msg.includes('exam') || msg.includes('study') || msg.includes('cgpa')) return ['How to improve my CGPA?', 'Best revision techniques?', 'How many hours should I study?'];
  return ['Tell me more', 'Give me an example', 'How do I start?'];
};

export default AIMentor;
