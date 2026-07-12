import { createContext, useState, useEffect } from 'react';
import { getMe, loginUser, signupUser } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setLoading(true);
      getMe()
        .then((response) => {
          setUser(response.data.user);
          setToken(storedToken);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const response = await loginUser(email, password);
    const { user: userData, token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    setUser(userData);
    setToken(newToken);
    return response.data;
  }

  async function signup(full_name, company_name, email, password) {
    const response = await signupUser(full_name, company_name, email, password);
    const { user: userData, token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    setUser(userData);
    setToken(newToken);
    return response.data;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
