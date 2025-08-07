import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 shadow-md border-b border-rose-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 text-purple-700 font-bold text-xl">
          <Shield className="text-rose-500" size={24} />
          <Link to={user?.role === 'hr' ? "/hr-dashboard" : "/dashboard"} className="hover:text-pink-600 transition">
            NaariSeva
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-purple-700">
          {!user && (
            <>
              <Link to="/home" className="hover:text-pink-600 transition">Home</Link>
              <Link to="/about" className="hover:text-pink-600 transition">About Us</Link>
              
              <Link to="/result" className="hover:text-pink-600 transition">Result</Link>
              
              <Link to="/ContactUs" className="hover:text-pink-600 transition">Contact Us</Link>
              <Link to="/login" className="hover:text-pink-600 transition">Login</Link>
              <Link to="/register" className="hover:text-pink-600 transition">Register</Link>
            </>
          )}

          {user?.role === 'user' && (
            <>
              {/* <Link to="/complaints" className="hover:text-pink-600 transition">My Complaints</Link> */}
              <Link to="/home" className="hover:text-pink-600 transition">Home</Link>
              <Link to="/about" className="hover:text-pink-600 transition">About Us</Link>
              <Link to="/ContactUs" className="hover:text-pink-600 transition">Contact Us</Link>
              <Link to="/drafts/new" className="hover:text-pink-600 transition">Draft new</Link>

              <Link to="/vc" className="hover:text-pink-600 transition">Video Call</Link>
              <Link to="/cf" className="hover:text-pink-600 transition">Community Forum</Link>



              <Link to="/emotion" className="hover:text-pink-600 transition">Emotion Detector</Link>
              <Link to="/drafts" className="hover:text-pink-600 transition">My Drafts</Link>
              <Link to="/evidence" className="hover:text-pink-600 transition"> New Complaint</Link>
              <Link to="/chatbot" className="hover:text-pink-600 transition"> Chatbot</Link>


              {/* <Link to="/profile" className="hover:text-pink-600 transition">Profile</Link> */}
              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-800 transition"
              >
                Logout
              </button>
            </>
          )}

          {user?.role === 'hr' && (
            <>
            <Link to="/home" className="hover:text-pink-600 transition">Home</Link>
              {/* <Link to="/about" className="hover:text-pink-600 transition">About Us</Link>
              <Link to="/ContactUs" className="hover:text-pink-600 transition">Contact Us</Link> */}

              {/* <Link to="/hr-dashboard" className="hover:text-pink-600 transition">Dashboard HR</Link> */}
              <Link to="/fake" className="hover:text-pink-600 transition">Deepfake Detector</Link>
              <Link to="/dashboard" className="hover:text-pink-600 transition">Dashboard</Link>
              <Link to="/protect" className="hover:text-pink-600 transition">Harassment Detector</Link>
              <Link to="/hr/complaints" className="hover:text-pink-600 transition">Complaints</Link>
              <Link to="/hr/evidenceVault" className="hover:text-pink-600 transition">Evidence Vault</Link>
              <Link to="/hr-profile" className="hover:text-pink-600 transition">Profile</Link>
              {/* <Link to="/hr/complaints" className="hover:text-pink-600 transition">Complaints</Link> */}
              <Link to="/hr/perpetrators" className="hover:text-pink-600 transition">Perpetrators</Link>



              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-800 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
