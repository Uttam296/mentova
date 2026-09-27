import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Establish one Socket.IO connection per logged-in user, and join their
  // personal room on the backend so it can push messages to them by userId.
  useEffect(() => {
    if (user?._id) {
      const s = io(SOCKET_URL);
      s.on('connect', () => {
        s.emit('join', user._id);
      });
      socketRef.current = s;
      setSocket(s);

      return () => {
        s.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    }
  }, [user?._id]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/users/profile`);
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, API, socket }}>
      {children}
    </AuthContext.Provider>
  );
};