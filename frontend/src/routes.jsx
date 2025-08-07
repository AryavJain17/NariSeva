import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MyComplaintsPage from './pages/complaints/MyComplaintsPage';
import CreateComplaintPage from './pages/complaints/CreateComplaintPage';
import ViewComplaintPage from './pages/complaints/ViewComplaintPage';
import DraftsPage from './pages/complaints/DraftsPage';
import HRComplaintsPage from './pages/hr/HRComplaintsPage';
import PerpetratorsPage from './pages/hr/PerpetratorsPage';
import HRDashboardPage from './pages/hr/HRDashboardPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      
      {/* User routes */}
      <Route path="/complaints" element={user ? <MyComplaintsPage /> : <Navigate to="/login" />} />
      <Route path="/complaints/new" element={user?.role === 'user' ? <CreateComplaintPage /> : <Navigate to="/" />} />
      <Route path="/complaints/:id" element={user ? <ViewComplaintPage /> : <Navigate to="/login" />} />
      <Route path="/drafts" element={user?.role === 'user' ? <DraftsPage /> : <Navigate to="/" />} />
      
      {/* HR routes */}
      <Route path="/hr/dashboard" element={user?.role === 'hr' ? <HRDashboardPage /> : <Navigate to="/" />} />
      <Route path="/hr/complaints" element={user?.role === 'hr' ? <HRComplaintsPage /> : <Navigate to="/" />} />
      <Route path="/hr/perpetrators" element={user?.role === 'hr' ? <PerpetratorsPage /> : <Navigate to="/" />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;