import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, AlertTriangle, Shield, Eye, EyeOff, Save } from 'lucide-react';

const HarassmentDetector = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [detectionResults, setDetectionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [showDetections, setShowDetections] = useState(true);
  const [detectionOpacity, setDetectionOpacity] = useState(0.8);
  const [groupDetections, setGroupDetections] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDetectionResults([]);
      setCurrentDetections([]);
      setSaveStatus('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append('video', videoFile);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      const detections = data.detections || [];
      setDetectionResults(detections);
      
      // Automatically save to database after analysis is complete
      if (detections.length > 0) {
        await saveAnalysisToDatabase(detections);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error occurred during analysis');
    }
    setLoading(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getHarassmentMoments = () => {
    const moments = [];
    detectionResults.forEach(detection => {
      if (!moments.some(m => Math.abs(m - detection.timestamp) < 1)) {
        moments.push(detection.timestamp);
      }
    });
    return moments.sort((a, b) => a - b);
  };

  const saveAnalysisToDatabase = async (detections) => {
    setSaveStatus('saving');
    
    try {
      // Calculate harassment moments from detections
      const moments = [];
      detections.forEach(detection => {
        if (!moments.some(m => Math.abs(m - detection.timestamp) < 1)) {
          moments.push(detection.timestamp);
        }
      });
      const harassmentMoments = moments.sort((a, b) => a - b);

      const incidentTimeline = harassmentMoments.map(timestamp => 
        ` Incident at ${formatTime(timestamp)}`
      );

      const reportData = {
        videoName: videoFile?.name || 'Unknown Video',
        totalIncidents: detections.length,
        riskLevel: detections.length > 15 ? 'HIGH' : 'MODERATE',
        incidentTimeline: incidentTimeline
      };

      console.log('Auto-saving analysis data:', reportData);

      const response = await fetch('http://localhost:1000/api/harassment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis automatically saved to database:', result);
      setSaveStatus('success');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error auto-saving analysis data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const sendHarassmentData = async () => {
    if (detectionResults.length === 0) {
      alert('No detection results to save');
      return;
    }

    await saveAnalysisToDatabase(detectionResults);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      const current = detectionResults.filter(detection => 
        Math.abs(detection.timestamp - time) < 0.5
      );
      setCurrentDetections(current);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const groupOverlappingBoxes = (boxes) => {
    if (!groupDetections) return boxes;

    const groups = [];
    const processed = new Set();

    boxes.forEach((box, index) => {
      if (processed.has(index)) return;

      const group = [box];
      processed.add(index);

      boxes.forEach((otherBox, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;

        const overlap = !(box.x2 < otherBox.x1 || 
                         otherBox.x2 < box.x1 || 
                         box.y2 < otherBox.y1 || 
                         otherBox.y2 < box.y1);
        
        const distance = Math.sqrt(
          Math.pow((box.x1 + box.x2)/2 - (otherBox.x1 + otherBox.x2)/2, 2) +
          Math.pow((box.y1 + box.y2)/2 - (otherBox.y1 + otherBox.y2)/2, 2)
        );

        if (overlap || distance < 150) {
          group.push(otherBox);
          processed.add(otherIndex);
        }
      });

      groups.push(group);
    });

    return groups;
  };

  const createGroupBoundingBox = (group) => {
    const minX = Math.min(...group.map(box => box.x1));
    const minY = Math.min(...group.map(box => box.y1));
    const maxX = Math.max(...group.map(box => box.x2));
    const maxY = Math.max(...group.map(box => box.y2));

    return {
      x1: minX,
      y1: minY,
      x2: maxX,
      y2: maxY,
      count: group.length
    };
  };

  const drawDetections = () => {
    if (!canvasRef.current || !videoRef.current || !showDetections) {
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (currentDetections.length === 0) return;
    
    const allBoxes = [];
    currentDetections.forEach(detection => {
      const scaleX = canvas.width / detection.video_width;
      const scaleY = canvas.height / detection.video_height;
      
      detection.boxes.forEach(box => {
        allBoxes.push({
          x1: box.x1 * scaleX,
          y1: box.y1 * scaleY,
          x2: box.x2 * scaleX,
          y2: box.y2 * scaleY,
          confidence: box.confidence
        });
      });
    });

    const boxGroups = groupOverlappingBoxes(allBoxes);

    boxGroups.forEach((group, groupIndex) => {
      if (Array.isArray(group)) {
        const boundingBox = createGroupBoundingBox(group);
        const x = boundingBox.x1;
        const y = boundingBox.y1;
        const width = boundingBox.x2 - boundingBox.x1;
        const height = boundingBox.y2 - boundingBox.y1;

        ctx.globalAlpha = detectionOpacity * 0.7;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(x, y, width, height);

        ctx.globalAlpha = 1;

        const labelText = boundingBox.count > 1 
          ? ` HARASSMENT DETECTED (${boundingBox.count} people)`
          : ' HARASSMENT DETECTED';
        
        const labelWidth = ctx.measureText(labelText).width + 10;
        const labelHeight = 25;
        const labelY = y > labelHeight ? y - labelHeight : y + height + 5;

        ctx.fillStyle = `rgba(239, 68, 68, ${detectionOpacity})`;
        ctx.fillRect(x, labelY, labelWidth, labelHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(labelText, x + 5, labelY + 17);

        if (boundingBox.count > 1) {
          group.forEach((box, index) => {
            const centerX = (box.x1 + box.x2) / 2;
            const centerY = (box.y1 + box.y2) / 2;
            
            ctx.fillStyle = `rgba(239, 68, 68, ${detectionOpacity * 0.8})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), centerX, centerY + 3);
            ctx.textAlign = 'left';
          });
        }
      } else {
        const x = group.x1;
        const y = group.y1;
        const width = group.x2 - group.x1;
        const height = group.y2 - group.y1;
        
        ctx.globalAlpha = detectionOpacity;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(x, y, width, height);

        ctx.globalAlpha = 1;

        const labelText = ' HARASSMENT DETECTED';
        const labelWidth = 200;
        const labelHeight = 25;
        const labelY = y > labelHeight ? y - labelHeight : y + height + 5;

        ctx.fillStyle = `rgba(239, 68, 68, ${detectionOpacity})`;
        ctx.fillRect(x, labelY, labelWidth, labelHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(labelText, x + 5, labelY + 17);
      }
    });

    ctx.globalAlpha = 1;
  };

  const handleVideoLoad = () => {
    drawDetections();
  };

  useEffect(() => {
    drawDetections();
  }, [currentDetections, showDetections, detectionOpacity, groupDetections]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (video) {
      video.addEventListener('loadedmetadata', handleVideoLoad);
      video.addEventListener('resize', drawDetections);
    }
    
    const resizeObserver = new ResizeObserver(drawDetections);
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleVideoLoad);
        video.removeEventListener('resize', drawDetections);
      }
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [videoUrl]);

  const jumpToMoment = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          <Shield className="inline-block mr-2" />
          Real-time Harassment Detection System
        </h1>
        
        {/* Upload Section */}
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-600">Click to upload video file</span>
          </label>
          {videoFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {videoFile.name}
            </p>
          )}
        </div>

        {/* Control Buttons */}
        {videoFile && (
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Video'}
            </button>
            
            {/* Show save status */}
            {saveStatus && (
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' : 
                saveStatus === 'success' ? 'bg-green-100 text-green-800' : 
                saveStatus === 'error' ? 'bg-red-100 text-red-800' : ''
              }`}>
                <Save className="w-4 h-4" />
                {saveStatus === 'saving' ? 'Saving to database...' : 
                 saveStatus === 'success' ? 'Saved to database!' : 
                 saveStatus === 'error' ? 'Failed to save!' : ''}
              </div>
            )}
          </div>
        )}

        {/* Detection Controls */}
        {detectionResults.length > 0 && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-3">Detection Display Settings</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowDetections(!showDetections)}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  showDetections ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                {showDetections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showDetections ? 'Hide' : 'Show'} Detections
              </button>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={groupDetections}
                  onChange={(e) => setGroupDetections(e.target.checked)}
                  className="rounded"
                />
                Group overlapping detections
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm">Opacity:</label>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.1"
                  value={detectionOpacity}
                  onChange={(e) => setDetectionOpacity(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">
                  {Math.round(detectionOpacity * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Section */}
        {videoUrl && (
          <div className="mb-6">
            <div 
              ref={containerRef} 
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ paddingTop: '56.25%' }}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="absolute top-0 left-0 w-full h-full object-contain"
                controls={false}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ 
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4" style={{ zIndex: 20 }}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-blue-400"
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </button>
                  <span className="text-white text-sm">
                    {formatTime(currentTime)}
                  </span>
                  {currentDetections.length > 0 && showDetections && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        HARASSMENT DETECTED ({currentDetections.reduce((sum, d) => sum + d.boxes.length, 0)} people)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detection Results */}
        {detectionResults.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Detection Summary
              </h3>
              <div className="space-y-2">
                <p className="text-red-700">
                  <strong>Total Incidents:</strong> {detectionResults.length}
                </p>
                <p className="text-red-700">
                  <strong>Risk Level:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    detectionResults.length > 15 
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {detectionResults.length > 15 ? 'HIGH' : 'MODERATE'}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Incident Timeline
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {getHarassmentMoments().map((timestamp, index) => (
                  <button
                    key={index}
                    onClick={() => jumpToMoment(timestamp)}
                    className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded"
                  >
                     Incident at {formatTime(timestamp)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Analyzing video for harassment incidents...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HarassmentDetector;