import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import api from './api';

import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { Dashboard } from './dashboard';

interface User {
  Id: number;
  FullName: string;
  Email: string;
  Role: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing session on page load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleLoginSuccess = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear refresh token
      await api.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setCurrentPage('login');
    }
  };

  // Show loading while checking for existing session
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return currentPage === 'login' ? (
    <LoginPage onRegisterClick={() => setCurrentPage('register')} onLoginSuccess={handleLoginSuccess} />
  ) : currentPage === 'register' ? (
    <RegisterPage onBackToLogin={() => setCurrentPage('login')} />
  ) : (
    <Dashboard onLogout={handleLogout} user={user || undefined} />
  );
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

