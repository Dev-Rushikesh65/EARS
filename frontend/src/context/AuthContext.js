import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Set theme on body element
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          // Try to get user data to verify token is valid
          const res = await axios.get('http://localhost:5000/api/auth/me');

          if (res.data.success) {
            setToken(storedToken);
            setUser(res.data.data);
            setIsAuthenticated(true);
            setError(null);
          } else {
            // If response is not successful, clear token
            clearAuthState();
          }
        } catch (err) {
          console.error('Token validation error:', err);
          // If error occurs (like expired token), clear token
          clearAuthState();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', { ...userData, password: '***' });

      // Ensure the API endpoint is correct
      const apiUrl = 'http://localhost:5000/api/auth/register';
      console.log('Sending registration request to:', apiUrl);

      // Set headers explicitly
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(apiUrl, userData, config);

      console.log('Registration response:', res.data);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.data);
        setIsAuthenticated(true);
        setError(null);
        return true;
      } else {
        // Handle case where success is false but no error was thrown
        const errorMsg = res.data.message || 'Registration failed';
        console.error('Registration failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);

      // Get detailed error message
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      console.error('Error details:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.data);
        setIsAuthenticated(true);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }

    clearAuthState();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Add a function to clear auth state
  const clearAuthState = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 