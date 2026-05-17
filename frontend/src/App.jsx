/**
 * Visual Workspace Platform - Frontend
 * Main App Component with routing and state management
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';
import { NotificationContext } from './context/NotificationContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/global.css';
import './styles/variables.css';
import './styles/animations.css';

// ============ PROTECTED ROUTE COMPONENT ============

const ProtectedRoute = ({ element, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// ============ MAIN APP COMPONENT ============

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState([]);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          // Verify token by fetching current user
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear auth
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Notification handler
  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    if (duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Auth handlers
  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    addNotification('Logged in successfully!', 'success');
  };

  const handleSignup = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    addNotification('Account created successfully!', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    addNotification('Logged out', 'info');
  };

  return (
    <Provider store={store}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <AuthContext.Provider
          value={{
            user,
            isAuthenticated,
            isLoading,
            handleLogin,
            handleSignup,
            handleLogout,
          }}
        >
          <NotificationContext.Provider
            value={{
              notifications,
              addNotification,
              removeNotification,
            }}
          >
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      element={<DashboardPage />}
                      isAuthenticated={isAuthenticated}
                      isLoading={isLoading}
                    />
                  }
                />
                <Route
                  path="/project/:projectId"
                  element={
                    <ProtectedRoute
                      element={<ProjectPage />}
                      isAuthenticated={isAuthenticated}
                      isLoading={isLoading}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute
                      element={<SettingsPage />}
                      isAuthenticated={isAuthenticated}
                      isLoading={isLoading}
                    />
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Notification Container */}
              <NotificationContainer />
            </Router>
          </NotificationContext.Provider>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </Provider>
  );
}

// ============ NOTIFICATION CONTAINER COMPONENT ============

function NotificationContainer() {
  const { notifications, removeNotification } = React.useContext(NotificationContext);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type} animate-slide-in`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            {notification.type === 'success' && <span className="notification-icon">✓</span>}
            {notification.type === 'error' && <span className="notification-icon">✕</span>}
            {notification.type === 'info' && <span className="notification-icon">ℹ</span>}
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
