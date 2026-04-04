import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('codehub_user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('codehub_token', res.data.access_token);
    const me = await api.get('/users/me');
    localStorage.setItem('codehub_user', JSON.stringify(me.data));
    setUser(me.data);
    return me.data;
  };

  const register = async (username, email, password) => {
    await api.post('/auth/register', { username, email, password });
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('codehub_token');
    localStorage.removeItem('codehub_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
