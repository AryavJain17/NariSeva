import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <h1>Women Harassment Portal</h1>
        </Link>

        {isAuthenticated() && (
          <div className="header-user">
            <div 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-name">Welcome, {user?.name}</span>
              <span className="user-role">({user?.role})</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            {showUserMenu && (
              <div className="user-menu">
                <Link 
                  to="/profile" 
                  className="user-menu-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="user-menu-item logout-button"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;