import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Shield, AlertTriangle, Eye, Download, Filter, Calendar, Play, Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';

// Main Dashboard Component
function WomenSafetyDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoError, setVideoError] = useState(null);

  // Fetch data from your MongoDB database
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:1000/api/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports from database:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timeout - Server may be down');
      } else if (error.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure server is running on port 1000');
      } else {
        setError(error.message);
      }
      
      setLoading(false);
    }
  };

  const fetchReportById = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:1000/api/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching specific report:', error);
      return null;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return '#ef4444';
      case 'MODERATE': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <AlertCircle className="w-5 h-5" />;
      case 'MODERATE': return <AlertTriangle className="w-5 h-5" />;
      case 'LOW': return <Shield className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const levelMatch = filterLevel === 'ALL' || report.risk_level === filterLevel;
    const dateMatch = dateFilter === 'ALL' || new Date(report.created_at).toDateString() === new Date().toDateString();
    return levelMatch && dateMatch;
  });

  const riskDistribution = [
    { name: 'High Risk', value: reports.filter(r => r.risk_level === 'HIGH').length, color: '#ef4444' },
    { name: 'Moderate Risk', value: reports.filter(r => r.risk_level === 'MODERATE').length, color: '#f59e0b' },
    { name: 'Low Risk', value: reports.filter(r => r.risk_level === 'LOW').length, color: '#10b981' }
  ];

  const incidentTrends = reports.map(report => ({
    name: report.video_name.substring(0, 15) + '...',
    incidents: report.total_incidents,
    risk: report.risk_level,
    date: new Date(report.created_at).toLocaleDateString()
  }));

  const parseTimeline = (timeline) => {
    return timeline.map((incident, index) => {
      const timeMatch = incident.match(/(\d+):(\d+)/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        return {
          time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          timeInSeconds: minutes * 60 + seconds,
          index: index + 1
        };
      }
      return { time: 'Unknown', timeInSeconds: 0, index: index + 1 };
    });
  };

  const downloadReport = (report) => {
    const reportData = {
      reportId: report._id,
      videoName: report.video_name,
      totalIncidents: report.total_incidents,
      riskLevel: report.risk_level,
      timeline: report.incident_timeline,
      analysisDate: new Date(report.created_at).toLocaleString(),
      summary: `Analysis of ${report.video_name} revealed ${report.total_incidents} incidents with ${report.risk_level} risk level.`,
      recommendations: getRiskRecommendations(report.risk_level),
      videoPath: `../uploads/videos/${report.video_name}`
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `safety_report_${report.video_name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getRiskRecommendations = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH':
        return [
          'Immediate intervention required',
          'Increase security presence in this area',
          'Review and enhance safety protocols',
          'Consider installing additional surveillance',
          'Implement emergency response procedures'
        ];
      case 'MODERATE':
        return [
          'Monitor situation closely',
          'Consider preventive measures',
          'Review safety guidelines with staff',
          'Increase patrol frequency',
          'Implement awareness programs'
        ];
      case 'LOW':
        return [
          'Continue regular monitoring',
          'Maintain current safety measures',
          'Conduct periodic safety reviews',
          'Keep incident documentation updated'
        ];
      default:
        return ['Review and assess situation'];
    }
  };

  const viewVideo = (report) => {
    setCurrentVideo(report);
    setShowVideoPlayer(true);
    setVideoError(null);
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setCurrentVideo(null);
    setVideoError(null);
  };

  const handleVideoError = () => {
    setVideoError(`Video file not found: uploads/videos/${currentVideo?.video_name}`);
  };

  const parseTimeToSeconds = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading safety reports from database...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to MongoDB at localhost:1000</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Failed to connect to the database</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Please ensure:</p>
            <p>• MongoDB server is running</p>
            <p>• Express server is running on port 1000</p>
            <p>• Database contains the harassment_reports collection</p>
          </div>
          <button 
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Women Safety Monitoring</h1>
                <p className="text-sm text-gray-600">Real-time harassment detection & analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchReports}
                className="bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span className="text-green-800 font-medium">Refresh Data</span>
              </button>
              <div className="bg-purple-100 px-3 py-2 rounded-lg">
                <span className="text-purple-800 font-semibold">{reports.length} Reports Analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Cases</p>
                <p className="text-3xl font-bold text-red-600">{reports.filter(r => r.risk_level === 'HIGH').length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderate Risk</p>
                <p className="text-3xl font-bold text-yellow-600">{reports.filter(r => r.risk_level === 'MODERATE').length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Risk Cases</p>
                <p className="text-3xl font-bold text-green-600">{reports.filter(r => r.risk_level === 'LOW').length}</p>
              </div>
              <Shield className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-3xl font-bold text-blue-600">{reports.reduce((sum, r) => sum + r.total_incidents, 0)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Incident Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Incident Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incidents" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Detailed Reports</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Play className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.video_name}</div>
                          <div className="text-sm text-gray-500">Video Analysis</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span style={{ color: getRiskColor(report.risk_level) }}>
                          {getRiskIcon(report.risk_level)}
                        </span>
                        <span className="ml-2 text-sm font-medium" style={{ color: getRiskColor(report.risk_level) }}>
                          {report.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {report.total_incidents} incidents
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {report.incident_timeline.length} events
                        <div className="text-xs text-gray-500">
                          {report.incident_timeline.slice(0, 2).map((incident, i) => (
                            <div key={i}>{incident.trim()}</div>
                          ))}
                          {report.incident_timeline.length > 2 && (
                            <div className="text-purple-600 cursor-pointer" onClick={() => setSelectedReport(report)}>
                              +{report.incident_timeline.length - 2} more...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => viewVideo(report)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Video
                        </button>
                        <button
                          onClick={() => downloadReport(report)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Video Analysis Player</h2>
                  <p className="text-sm text-gray-600">{currentVideo.video_name}</p>
                </div>
                <button
                  onClick={closeVideoPlayer}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player Section */}
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
                    {!videoError ? (
                      <video
                        controls
                        className="w-full h-auto max-h-96"
                        onError={handleVideoError}
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='24' fill='%236b7280' text-anchor='middle'%3ELoading Video...%3C/text%3E%3C/svg%3E"
                      >
                        <source src={`../uploads/videos/${currentVideo.video_name}`} type="video/mp4" />
                        <source src={`./uploads/videos/${currentVideo.video_name}`} type="video/mp4" />
                        <source src={`uploads/videos/${currentVideo.video_name}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-100">
                        <div className="text-center">
                          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Video Not Found</p>
                          <p className="text-sm text-gray-500 mb-4">{videoError}</p>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>Expected locations:</p>
                            <p>• ../uploads/videos/{currentVideo.video_name}</p>
                            <p>• ./uploads/videos/{currentVideo.video_name}</p>
                            <p>• uploads/videos/{currentVideo.video_name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Controls & Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Risk Level</p>
                        <div className="flex items-center justify-center mt-1">
                          <span style={{ color: getRiskColor(currentVideo.risk_level) }}>
                            {getRiskIcon(currentVideo.risk_level)}
                          </span>
                          <span className="ml-1 font-medium" style={{ color: getRiskColor(currentVideo.risk_level) }}>
                            {currentVideo.risk_level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Incidents</p>
                        <p className="text-lg font-bold text-purple-600">{currentVideo.total_incidents}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Timeline Events</p>
                        <p className="text-lg font-bold text-blue-600">{currentVideo.incident_timeline.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Analysis Date</p>
                        <p className="text-sm text-gray-700">{new Date(currentVideo.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incident Timeline Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Incident Timeline
                    </h3>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {currentVideo.incident_timeline.map((incident, index) => {
                        const timeMatch = incident.match(/(\d+):(\d+)/);
                        const timeInSeconds = timeMatch ? parseTimeToSeconds(incident) : 0;
                        
                        return (
                          <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-red-400 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-red-600">
                                Incident #{index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(timeInSeconds)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{incident.trim()}</p>
                            <button 
                              onClick={() => {
                                const video = document.querySelector('video');
                                if (video && !videoError) {
                                  video.currentTime = timeInSeconds;
                                  video.play();
                                }
                              }}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              disabled={videoError}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Jump to Time
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => downloadReport(currentVideo)}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Detailed Analysis Report</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedReport.video_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
                    <div className="flex items-center">
                      <span style={{ color: getRiskColor(selectedReport.risk_level) }}>
                        {getRiskIcon(selectedReport.risk_level)}
                      </span>
                      <span className="ml-2 font-medium" style={{ color: getRiskColor(selectedReport.risk_level) }}>
                        {selectedReport.risk_level} RISK
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Incidents Detected</label>
                    <p className="text-2xl font-bold text-purple-600">{selectedReport.total_incidents}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Timeline Visualization</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={parseTimeline(selectedReport.incident_timeline)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="index" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Assessment & Recommendations</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Recommended Actions:</span>
                  </div>
                  <ul className="space-y-1">
                    {getRiskRecommendations(selectedReport.risk_level).map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Analysis</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Video File Location:</p>
                      <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded mt-1">
                        /uploads/videos/{selectedReport.video_name}
                      </p>
                    </div>
                    <button
                      onClick={() => viewVideo(selectedReport)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Video
                    </button>
                  </div>
                </div>
              </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Timeline</label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {selectedReport.incident_timeline.map((incident, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border-l-4 border-red-400">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Incident #{index + 1}</span>
                      <span className="text-sm text-gray-600">{incident.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Report ID: {selectedReport._id}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadReport(selectedReport)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        
      )}
    </div>
  );
}

// Export the component as default
export default WomenSafetyDashboard;