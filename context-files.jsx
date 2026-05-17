/**
 * React Context Files
 * Global state for authentication, theme, and notifications
 */

// ============ context/AuthContext.jsx ============

import React from 'react';

export const AuthContext = React.createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  handleLogin: () => {},
  handleSignup: () => {},
  handleLogout: () => {},
});

// ============ context/ThemeContext.jsx ============

export const ThemeContext = React.createContext({
  theme: 'light',
  setTheme: () => {},
});

// ============ context/NotificationContext.jsx ============

export const NotificationContext = React.createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});
