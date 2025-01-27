import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import './App.css';

const AuthenticatedApp = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <nav className="navbar">
        <h1>EmpathIQ</h1>
        <div className="nav-right">
          <span>Welcome, {user.username}!</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
      <Chat />
    </div>
  );
};

const UnauthenticatedApp = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="app">
      <h1 className="app-title">EmpathIQ</h1>
      {isLogin ? (
        <Login onToggleForm={() => setIsLogin(false)} />
      ) : (
        <Register onToggleForm={() => setIsLogin(true)} />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

export default App; 