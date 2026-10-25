import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const BASE = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount via HTTP-only cookie
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async (retries = 1) => {
      try {
        const res = await fetch(`${BASE}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        if (retries > 0) {
          // Retry once after 350ms in case dev proxy was warming up
          await new Promise((r) => setTimeout(r, 350));
          if (isMounted) return checkAuth(retries - 1);
        }
        console.error('Session check error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Register function
  const register = async ({ name, username, email, password, role }) => {
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, username, email, password, role })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // Login function
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // Google Login function
  const loginWithGoogle = async (credential, role = 'client', isSignup = false) => {
    try {
      const res = await fetch(`${BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential, role, isSignup })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google authentication failed');
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // Switch role between Client and Freelancer
  const switchRole = async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to switch workspace');
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  // Update in-memory user directly (safely merges with existing user state)
  const updateUser = (updated) => {
    setUser(prev => {
      if (!prev) return updated;
      if (typeof updated === 'function') return updated(prev);
      return { ...prev, ...updated };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, switchRole, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
