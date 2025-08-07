import React, { useState } from 'react';
import { FileText, Image, Music, Lock, Eye, Folder, X, Shield } from 'lucide-react';

const evidenceData = [
  {
    name: 'Folder 1',
    files: [
      { type: 'image', name: 'a.jpg', src: '/media/a.jpg' },
      { type: 'audio', name: 'a.mp3', src: '/media/a.mp3' },
    ],
  },
  {
    name: 'Folder 2',
    files: [
      { type: 'image', name: 'b.jpg', src: '/media/b.jpg' },
    ],
  },
  {
    name: 'Folder 3',
    files: [
      { type: 'image', name: 'c.jpg', src: '/media/c.jpg' },
      { type: 'audio', name: 'c.mp3', src: '/media/c.mp3' },
    ],
  },
];

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-800">File Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const EvidenceVault = () => {
  const [activeFile, setActiveFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const correctPassword = 'aryav';

  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  const renderFileIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'document': return <FileText className={`${iconClass} text-purple-600`} />;
      case 'image': return <Image className={`${iconClass} text-pink-600`} />;
      case 'audio': return <Music className={`${iconClass} text-rose-600`} />;
      default: return null;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'document': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'image': return 'bg-pink-50 border-pink-200 hover:bg-pink-100';
      case 'audio': return 'bg-rose-50 border-rose-200 hover:bg-rose-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-rose-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}></div>
        </div>
        
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Evidence Vault</h2>
            <p className="text-pink-100">Secure documentation for survivors and advocates</p>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your secure access code"
                className="w-full bg-white/10 backdrop-blur-sm border border-pink-200/30 rounded-xl px-12 py-4 text-white placeholder-pink-200 focus:outline-none focus:border-pink-400 focus:bg-white/20 transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}
            
            <button 
              onClick={handlePasswordSubmit}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Access SafeSpace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Evidence Vault</h1>
                <p className="text-sm text-gray-600">Confidential documentation and evidence storage</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-pink-600">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span>Protected & Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8">
          {evidenceData.map((folder, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Folder Header */}
              <div className="bg-gradient-to-r from-pink-800 to-purple-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Folder className="w-6 h-6 text-pink-200" />
                  <h3 className="text-xl font-semibold text-white">{folder.name}</h3>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                    {folder.files.length} files
                  </span>
                </div>
              </div>

              {/* Files Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folder.files.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFile(file)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${getFileTypeColor(file.type)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {renderFileIcon(file.type)}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{file.type} file</p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {activeFile && (
        <Modal isOpen={!!activeFile} onClose={() => setActiveFile(null)}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b">
              {renderFileIcon(activeFile.type)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{activeFile.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{activeFile.type} file</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              {activeFile.type === 'document' && (
                <iframe
                  src={activeFile.src}
                  title={activeFile.name}
                  className="w-full h-96 border-0 rounded-lg"
                ></iframe>
              )}
              {activeFile.type === 'image' && (
                <img 
                  src={activeFile.src} 
                  alt={activeFile.name} 
                  className="w-full max-h-96 object-contain rounded-lg shadow-sm" 
                />
              )}
              {activeFile.type === 'audio' && (
                <div className="text-center py-8">
                  <Music className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                  <audio controls src={activeFile.src} className="w-full max-w-md mx-auto">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EvidenceVault;