import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user, API } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [API]);

  useEffect(() => {
    if (userId) {
      fetchUserAndMessages(userId);
    }
  }, [userId, API]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/messages`);
      setConversations(res.data);
    } catch {}
  };

  const fetchUserAndMessages = async (uid) => {
    setLoading(true);
    try {
      const [userRes, msgRes] = await Promise.all([
        axios.get(`${API}/users/${uid}`),
        axios.get(`${API}/messages/${uid}`)
      ]);
      setActiveUser(userRes.data);
      setMessages(msgRes.data);
    } catch {}
    setLoading(false);
  };

  const selectConversation = (conv) => {
    navigate(`/chat/${conv.user._id}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeUser) return;
    const content = input.trim();
    setInput('');
    try {
      const res = await axios.post(`${API}/messages`, { receiverId: activeUser._id, content });
      setMessages(prev => [...prev, res.data]);
      fetchConversations();
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConvs = conversations.filter(c =>
    !search || c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const QUICK_REPLIES = [
    'Can you explain this concept?', 'What resources do you recommend?',
    'How did you prepare for placements?', 'Which projects should I build?',
    'What are the best internship platforms?', 'How to manage studies and coding?'
  ];

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="msg-count">
            {conversations.reduce((sum, c) => sum + (c.unread || 0), 0) > 0 && (
              <span className="unread-badge">{conversations.reduce((sum, c) => sum + (c.unread || 0), 0)}</span>
            )}
          </div>
        </div>
        <div className="sidebar-search">
          <input type="text" className="form-control" placeholder="🔍 Search conversations..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="conversations-list">
          {filteredConvs.length === 0 ? (
            <div className="no-convs">
              <p>No conversations yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/mentors')}>
                Find Mentors
              </button>
            </div>
          ) : filteredConvs.map(c => (
            <div
              key={c.user._id}
              className={`conv-item ${userId === c.user._id ? 'active' : ''}`}
              onClick={() => selectConversation(c)}
            >
              <div className="avatar avatar-sm">{initials(c.user?.name)}</div>
              <div className="conv-info">
                <div className="conv-name">{c.user?.name}</div>
                <div className="conv-last">
                  {c.lastMessage?.content?.slice(0, 35)}{c.lastMessage?.content?.length > 35 ? '...' : ''}
                </div>
              </div>
              <div className="conv-meta">
                <div className="conv-time">{c.lastMessage ? formatTime(c.lastMessage.timestamp) : ''}</div>
                {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {!activeUser ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose from your existing conversations or find a mentor to start chatting.</p>
            <button className="btn btn-primary" onClick={() => navigate('/mentors')}>
              Find Mentors →
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <button className="back-btn" onClick={() => navigate('/chat')}>←</button>
              <div className="avatar avatar-md">{initials(activeUser.name)}</div>
              <div className="chat-header-info">
                <div className="chat-header-name">{activeUser.name}</div>
                <div className="chat-header-meta">
                  {activeUser.year} Year · {activeUser.department}
                  <span className={`badge ${activeUser.role === 'mentor' ? 'badge-mentor' : 'badge-mentee'}`} style={{ marginLeft: 8 }}>
                    {activeUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner"></div></div>
              ) : messages.length === 0 ? (
                <div className="chat-start">
                  <div className="avatar avatar-lg">{initials(activeUser.name)}</div>
                  <h4>Start a conversation with {activeUser.name}</h4>
                  <p>Ask anything about academics, internships, career choices, or college life.</p>
                  <div className="quick-replies">
                    {QUICK_REPLIES.map((q, i) => (
                      <button key={i} className="quick-reply-btn" onClick={() => setInput(q)}>{q}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const showDate = idx === 0 || formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                    return (
                      <React.Fragment key={msg._id}>
                        {showDate && <div className="date-divider"><span>{formatDate(msg.timestamp)}</span></div>}
                        <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                          {!isMine && <div className="avatar avatar-sm">{initials(activeUser.name)}</div>}
                          <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                            {msg.content}
                            <div className="msg-time">{formatTime(msg.timestamp)}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              {messages.length > 0 && (
                <div className="quick-replies-row">
                  {QUICK_REPLIES.slice(0, 3).map((q, i) => (
                    <button key={i} className="quick-reply-chip" onClick={() => setInput(q)}>{q}</button>
                  ))}
                </div>
              )}
              <div className="chat-input-row">
                <textarea
                  className="chat-input"
                  placeholder={`Message ${activeUser.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  ➤
                </button>
              </div>
              <div className="chat-hint">Press Enter to send · Shift+Enter for new line</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
