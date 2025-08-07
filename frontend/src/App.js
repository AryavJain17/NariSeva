import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';

// Complaint Components
import ComplaintForm from './components/Complaints/ComplaintForm';
import ComplaintList from './components/Complaints/ComplaintList';
import ComplaintDetail from './components/Complaints/ComplaintDetail';

// Draft Components
import DraftForm from './components/Drafts/DraftForm';
import DraftList from './components/Drafts/DraftList';
import DraftDetail from './components/Drafts/DraftDetail';

// HR Components
import HRDashboard from './components/HR/HRDashboard';
import HRComplaintList from './components/HR/HRComplaintList';
import PerpetratorsList from './components/HR/PerpetratorsList';
import HRProfile from './components/HR/HRProfile';
import AboutUs from './components/Dhuri/AboutUs';
import ContactUs from './components/Dhuri/ContactUs';
// Styles
import './styles/App.css';
import Navbar from './components/Layout/Navbar';
import Home from './components/Dhuri/Home';
import HarassmentDetector from './components/Dhuri/HarassmentDetector';
import Result from './components/Dhuri/Result.jsx';
import WomenSafetyDashboard from './components/Dhuri/WomenSafetyDashboard.jsx';
import DeepfakeDetector from './components/Dhuri/DeepfakeDetector.jsx';
import IncidentReportGenerator from './components/Dhuri/IncidentReportGen.jsx';
import EmotionDetector from './components/Dhuri/EmotionDetector.jsx';
import WomensEmpowermentChatbot from './components/Dhuri/WomensEmpowermentChatbot.jsx';
import EvidenceVault from './components/Dhuri/EvidenceVault.js';
import LanguageSelector from './LanguageSelector.js';
import MentorConnect from './MentorConnect.js';
import CommunityForum from './CommunityForum.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar/>
          <LanguageSelector />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />

            <Route path='/about' element = {<AboutUs/>} />
            <Route path='/dashboard' element = {<WomenSafetyDashboard/>} />
          <Route path='/fake' element = {<DeepfakeDetector/>} />
          <Route path='/protect' element = {<HarassmentDetector/>} />
          <Route path='/result' element = {<Result/>} />
          
          <Route path='/ContactUs' element = {<ContactUs/>} />

            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/home" replace />
                </Layout>
              </ProtectedRoute>
            } />

            {/* User Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } />
              <Route path="/cf" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <CommunityForum />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vc" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <MentorConnect />
                </Layout>
              </ProtectedRoute>
            } />

            {/* HR Dashboard */}
            <Route path="/hr-dashboard" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <HRDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Profile Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
<Route path='/dashboard' element = {<WomenSafetyDashboard/>} />
          <Route path='/fake' element = {<DeepfakeDetector/>} />
          <Route path='/protect' element = {<HarassmentDetector/>} />
          <Route path="/fake" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <DeepfakeDetector />
                </Layout>
              </ProtectedRoute>
            } />
             <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <WomenSafetyDashboard />
                </Layout>
              </ProtectedRoute>
            } />
             <Route path="/protect" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <HarassmentDetector />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/hr-profile" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <HRProfile />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Complaint Routes */}
            <Route path="/complaints" element={
              <ProtectedRoute>
                <Layout>
                  <ComplaintList />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/new" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <ComplaintForm />
                </Layout>
              </ProtectedRoute>
            } />
              <Route path="/evidence" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <IncidentReportGenerator />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ComplaintDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/:id/edit" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <ComplaintForm />
                </Layout>
              </ProtectedRoute>
            } />

            {/* HR Complaint Management */}
            <Route path="/hr/complaints" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <HRComplaintList />
                </Layout>
              </ProtectedRoute>
            } />
  <Route path="/hr/evidenceVault" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <EvidenceVault />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/hr/perpetrators" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <Layout>
                  <PerpetratorsList />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Draft Routes */}
            <Route path="/drafts" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <DraftList />
                </Layout>
              </ProtectedRoute>
            } />
              <Route path="/chatbot" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <WomensEmpowermentChatbot />
                </Layout>
              </ProtectedRoute>
            } />
                <Route path="/emotion" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <EmotionDetector />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/drafts/new" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <DraftForm />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/drafts/:id" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <DraftDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/drafts/:id/edit" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout>
                  <DraftForm />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// User Dashboard Component
const UserDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {/* <h1>Welcome to Women Harassment Complaint Portal</h1>
        <p>Your voice matters. Report incidents safely and confidentially.</p> */}
      </div>

      <div className="dashboard-actions">
        <div className="action-cards">
          <div className="action-card">
            <div className="action-icon">📝</div>
            <h3>File a Complaint</h3>
            <p>Report a harassment incident with detailed information and evidence.</p>
            <a href="/complaints/new" className="btn btn-primary">
              File Complaint
            </a>
          </div>

          <div className="action-card">
            <div className="action-icon">💾</div>
            <h3>Save as Draft</h3>
            <p>Save your complaint as a draft and submit it later when ready.</p>
            <a href="/drafts/new" className="btn btn-secondary">
              Create Draft
            </a>
          </div>

          <div className="action-card">
            <div className="action-icon">📋</div>
            <h3>View My Complaints</h3>
            <p>Track the status of your submitted complaints and view updates.</p>
            <a href="/complaints" className="btn btn-outline-primary">
              View Complaints
            </a>
          </div>

          <div className="action-card">
            <div className="action-icon">📄</div>
            <h3>My Drafts</h3>
            <p>Continue working on saved drafts or submit them as complaints.</p>
            <a href="/drafts" className="btn btn-outline-primary">
              View Drafts
            </a>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        

       
          
      </div>
    </div>
  );
};

export default App;