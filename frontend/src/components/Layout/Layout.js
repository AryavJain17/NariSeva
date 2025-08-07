import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const isLoggedIn = isAuthenticated();

  return (
    <div className="app-layout">
      {/* <Header /> */}
      <div className="layout-container">
        {/* {isLoggedIn && user?.role && <Sidebar />} */}
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
