import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/complaints', label: 'My Complaints', icon: '📋' },
    { path: '/complaints/new', label: 'New Complaint', icon: '➕' },
    { path: '/drafts', label: 'My Drafts', icon: '📝' },
    { path: '/drafts/new', label: 'New Draft', icon: '✏️' },
  ];

  const hrMenuItems = [
    { path: '/hr/dashboard', label: 'HR Dashboard', icon: '🏢' },
    { path: '/hr/complaints', label: 'All Complaints', icon: '📊' },
    { path: '/hr/perpetrators', label: 'Perpetrators List', icon: '👥' },
    { path: '/hr/profile', label: 'HR Profile', icon: '⚙️' },
  ];

  const menuItems = user?.role === 'hr' ? hrMenuItems : userMenuItems;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActive(item.path)}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;