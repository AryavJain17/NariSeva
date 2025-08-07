import React, { useState, useRef } from 'react';
import { Upload, Play, Pause, AlertTriangle, CheckCircle, Eye, Clock, Camera, Zap, Shield, Activity, Brain, Star, Info, TrendingUp } from 'lucide-react';

const DeepfakeDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const analyzeVideo = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResults(null);
    
    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await fetch('http://localhost:2000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const processedData = {
        ...data,
        confidence: parseFloat(data.overall?.confidence || 0),
        isDeepfake: Boolean(data.overall?.is_deepfake || false),
        explanation: data.overall?.explanation || 'No explanation available',
        detectionMethods: [
          {
            method: 'MesoNet AI Detection',
            score: parseFloat(data.mesonet_analysis?.score || 0),
            evidence: data.mesonet_analysis?.evidence || 'No evidence found',
            frameCount: parseInt(data.mesonet_analysis?.deepfake_detections || 0),
            priority: 'HIGH',
            details: {
              deepfake_probability: parseFloat(data.mesonet_analysis?.deepfake_probability || 0),
              avg_confidence: parseFloat(data.mesonet_analysis?.avg_confidence || 0)
            }
          },
          {
            method: 'Facial Inconsistency Analysis',
            score: parseFloat(data.facial_inconsistencies?.score || 0),
            evidence: data.facial_inconsistencies?.evidence || 'No evidence found',
            frameCount: parseInt(data.facial_inconsistencies?.suspicious_frames || 0),
            priority: 'MEDIUM'
          },
          {
            method: 'Eye Pattern Analysis',
            score: parseFloat(data.eye_patterns?.score || 0),
            evidence: data.eye_patterns?.evidence || 'No evidence found',
            frameCount: parseInt(data.eye_patterns?.suspicious_patterns || 0),
            priority: 'MEDIUM'
          },
          {
            method: 'Texture Consistency Analysis',
            score: parseFloat(data.texture_consistency?.score || 0),
            evidence: data.texture_consistency?.evidence || 'No evidence found',
            frameCount: parseInt(data.texture_consistency?.inconsistencies || 0),
            priority: 'LOW'
          },
          {
            method: 'Frequency Domain Analysis',
            score: parseFloat(data.frequency_analysis?.score || 0),
            evidence: data.frequency_analysis?.evidence || 'No evidence found',
            frameCount: parseInt(data.frequency_analysis?.anomalies || 0),
            priority: 'LOW'
          }
        ],
        frameAnalysis: {
          totalFrames: parseInt(data.metadata?.total_frames || 0),
          suspiciousFrames: (
            parseInt(data.mesonet_analysis?.deepfake_detections || 0) +
            parseInt(data.facial_inconsistencies?.suspicious_frames || 0) +
            parseInt(data.texture_consistency?.inconsistencies || 0) +
            parseInt(data.frequency_analysis?.anomalies || 0)
          ),
          processingTime: data.metadata?.processing_time || 'N/A',
          mesonetAnalyzed: parseInt(data.mesonet_analysis?.analyzed_frames || 0)
        },
        technicalDetails: {
          aiModelUsed: 'MesoNet-4',
          analysisVersion: '3.0.0',
          detectionCapabilities: [
            'Deep learning face manipulation detection',
            'Geometric facial inconsistency analysis',
            'Temporal eye pattern analysis',
            'Texture consistency verification',
            'Frequency domain anomaly detection'
          ]
        }
      };
      
      setResults(processedData);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResults({
        error: true,
        message: error.message || 'Analysis failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-rose-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getConfidenceBg = (score) => {
    if (score >= 80) return 'bg-rose-50 border-rose-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    if (score >= 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <Star className="text-rose-500" size={16} />;
      case 'MEDIUM': return <TrendingUp className="text-orange-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-700 bg-rose-100 border-rose-200';
      case 'MEDIUM': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
            <Shield className="text-rose-500" />
            AI-Powered Deepfake Detection
          </h1>
          <p className="text-purple-700 mb-2">Advanced MesoNet neural network with multi-layer analysis</p>
          <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
            <span className="flex items-center gap-1">
              <Brain className="text-pink-500" size={16} />
              MesoNet AI
            </span>
            <span className="flex items-center gap-1">
              <Eye className="text-purple-500" size={16} />
              Computer Vision
            </span>
            <span className="flex items-center gap-1">
              <Activity className="text-rose-500" size={16} />
              Real-time Analysis
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Upload className="text-rose-500" />
              Upload Video for Analysis
            </h2>
            
            <div 
              className="border-2 border-dashed border-rose-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors cursor-pointer bg-rose-50/30"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mx-auto text-rose-400 mb-4" size={48} />
              <p className="text-purple-700 mb-2">Drop your video here or click to browse</p>
              <p className="text-sm text-purple-500">Supports MP4, AVI, MOV, WEBM files (max 100MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                <p className="text-purple-800 font-medium">{selectedFile.name}</p>
                <p className="text-purple-600 text-sm">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {previewUrl && (
              <div className="mt-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full rounded-lg border border-rose-200"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <button
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={analyzeVideo}
              disabled={!selectedFile || isProcessing}
              className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-purple-300 disabled:to-purple-300 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain />
                  Analyze with MesoNet AI
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Activity className="text-pink-500" />
              Detection Results
            </h2>

            {results?.error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 p-4 rounded-lg">
                <AlertTriangle className="inline mr-2" />
                <strong>Error:</strong> {results.message}
              </div>
            )}

            {!results && !isProcessing && (
              <div className="text-center py-12">
                <Shield className="mx-auto text-purple-300 mb-4" size={48} />
                <p className="text-purple-600">Upload and analyze a video to see AI-powered results</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent mx-auto mb-4"></div>
                <p className="text-purple-800 font-medium">MesoNet AI is analyzing...</p>
                <p className="text-purple-600 text-sm">Processing frames with deep neural network</p>
              </div>
            )}

            {results && !results.error && (
              <div className="space-y-6">
                {/* Overall Result */}
                <div className={`p-4 rounded-lg border-2 ${
                  results.isDeepfake 
                    ? 'bg-rose-50 border-rose-300' 
                    : 'bg-emerald-50 border-emerald-300'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {results.isDeepfake ? (
                      <AlertTriangle className="text-rose-500" />
                    ) : (
                      <CheckCircle className="text-emerald-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-purple-800">
                        {results.isDeepfake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC VIDEO'}
                      </h3>
                      <p className="text-sm text-purple-700">
                        AI Confidence: {results.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-60 rounded-md p-3 mt-3">
                    <p className="text-sm text-purple-800 font-medium mb-2">AI Analysis Explanation:</p>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      {results.explanation}
                    </p>
                  </div>
                </div>

                {/* Frame Analysis Summary */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Clock className="text-pink-500" />
                    Processing Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-600">Total Frames</p>
                      <p className="text-purple-800 font-medium">{results.frameAnalysis.totalFrames}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">AI Analyzed</p>
                      <p className="text-purple-800 font-medium">{results.frameAnalysis.mesonetAnalyzed}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Suspicious Detections</p>
                      <p className="text-purple-800 font-medium">{results.frameAnalysis.suspiciousFrames}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Processing Time</p>
                      <p className="text-purple-800 font-medium">{results.frameAnalysis.processingTime}</p>
                    </div>
                  </div>
                </div>

                {/* Detection Methods */}
                <div>
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Brain className="text-rose-500" />
                    AI Detection Methods & Evidence
                  </h4>
                  <div className="space-y-3">
                    {results.detectionMethods.map((method, index) => (
                      <div key={index} className={`rounded-lg p-4 border ${getConfidenceBg(method.score)}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-purple-800">{method.method}</h5>
                            {method.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(method.priority)}`}>
                                {getPriorityIcon(method.priority)}
                                {method.priority}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceBg(method.score)} ${getConfidenceColor(method.score)}`}>
                              {method.score.toFixed(1)}% Risk
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {method.method === 'MesoNet AI Detection' && method.details && (
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-md border border-pink-200 mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="text-pink-500" size={16} />
                                <span className="text-sm font-medium text-purple-800">Deep Learning Analysis</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-purple-600">Deepfake Probability:</span>
                                  <span className="text-purple-800 font-medium ml-1">
                                    {(method.details.deepfake_probability * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-purple-600">AI Confidence:</span>
                                  <span className="text-purple-800 font-medium ml-1">
                                    {(method.details.avg_confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className={`p-3 rounded-md ${method.score >= 70 ? 'bg-rose-50' : method.score >= 40 ? 'bg-orange-50' : 'bg-emerald-50'}`}>
                            <p className="text-sm font-medium text-purple-800 mb-1">Evidence Found:</p>
                            <p className="text-purple-700 text-sm">{method.evidence}</p>
                          </div>
                          
                          <div className="flex justify-between text-xs text-purple-600">
                            <span>Affected items: {method.frameCount}</span>
                            <span>
                              Severity: {method.score >= 70 ? 'Critical' : method.score >= 40 ? 'Moderate' : 'Low'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                    <Zap className={`text-purple-500 transition-transform ${showTechnicalDetails ? 'rotate-90' : ''}`} size={14} />
                  </button>

                  {showTechnicalDetails && (
                    <div className="mt-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h5 className="text-sm font-semibold text-purple-800 mb-2">Technical Specifications</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-purple-600">AI Model</p>
                          <p className="text-purple-800 font-medium">{results.technicalDetails.aiModelUsed}</p>
                        </div>
                        <div>
                          <p className="text-purple-600">Analysis Version</p>
                          <p className="text-purple-800 font-medium">{results.technicalDetails.analysisVersion}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-purple-600">Capabilities</p>
                          <ul className="list-disc list-inside text-purple-800">
                            {results.technicalDetails.detectionCapabilities.map((cap, i) => (
                              <li key={i} className="font-medium">{cap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className={`p-4 rounded-lg ${results.isDeepfake ? 'bg-rose-100 border-rose-300' : 'bg-emerald-100 border-emerald-300'} border`}>
                  <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <Shield className={results.isDeepfake ? 'text-rose-600' : 'text-emerald-600'} />
                    {results.isDeepfake ? 'Warning' : 'Verification'}
                  </h5>
                  <p className="text-sm text-purple-700">
                    {results.isDeepfake ? (
                      <>
                        This video shows strong signs of artificial manipulation. 
                        Exercise caution when sharing or believing its contents.
                      </>
                    ) : (
                      <>
                        Our analysis found no significant signs of manipulation. 
                        However, some sophisticated deepfakes may evade detection.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-purple-500">
          <p>Powered by MesoNet AI and advanced computer vision algorithms</p>
          <p className="mt-1">For research and educational purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetector;