import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, name: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  checkPermission: (allowedRoles: ('Admin' | 'Manager' | 'Viewer')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set default base URL for API requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for token & user on load
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        
        // Configure axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        // Corrupted storage, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email: string, name: string, password: string, role: string) => {
    await axios.post('/auth/register', {
      email,
      full_name: name,
      password,
      role,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkPermission = (allowedRoles: ('Admin' | 'Manager' | 'Viewer')[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, checkPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
