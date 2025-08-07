import React, { useState } from 'react';
import { Upload, FileText, Mic, Image, AlertCircle, Download, CheckCircle, Loader, Shield } from 'lucide-react';
import './IncidentReportGen.css';

const IncidentReportGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState({ audio: false, image: false });
  const [isAssessing, setIsAssessing] = useState(false);
  const [severityResult, setSeverityResult] = useState(null);
  const [showHrModal, setShowHrModal] = useState(false);
  const [hrEmail, setHrEmail] = useState('bluecndy18@gmail.com');

  const handleFileUpload = (file, type) => {
    if (type === 'audio') {
      if (file && (file.type.startsWith('audio/') || file.name.endsWith('.wav') || file.name.endsWith('.mp3'))) {
        setAudioFile(file);
        setError('');
      } else {
        setError('Please upload a valid audio file (.wav, .mp3)');
      }
    } else if (type === 'image') {
      if (file && file.type.startsWith('image/')) {
        setImageFile(file);
        setError('');
      } else {
        setError('Please upload a valid image file');
      }
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type);
    }
  };

  const generateReport = async () => {
    if (!audioFile && !imageFile && !additionalNotes.trim()) {
      setError('Please provide at least one form of evidence (audio, image, or notes)');
      return;
    }

    setIsGenerating(true);
    setError('');
    setReportResult(null);

    try {
      const formData = new FormData();
      if (audioFile) formData.append('audio', audioFile);
      if (imageFile) formData.append('image', imageFile);
      formData.append('additionalNotes', additionalNotes);

      const response = await fetch('http://localhost:5005/api/generate-report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setReportResult(result);
      } else {
        setError(result.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the Flask backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!reportResult?.zip_data) return;

    try {
      const response = await fetch('http://localhost:5005/api/download-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zip_data: reportResult.zip_data }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `incident_report_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download report');
      }
    } catch (err) {
      setError('Failed to download report');
    }
  };

  const assessSeverity = async () => {
    if (!reportResult?.zip_data) return;

    setIsAssessing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5005/api/assess-severity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          narrative_text: reportResult.narrative_preview,
          zip_data: reportResult.zip_data,
          hr_email: hrEmail
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSeverityResult(result);
        
        // For LOW severity, show notification
        if (result.severity === 'LOW') {
          alert("Your report has been logged. You may choose to escalate later if the behavior persists.");
        }
      } else {
        setError(result.error || 'Failed to assess severity');
      }
    } catch (err) {
      setError('Failed to connect to server during severity assessment');
    } finally {
      setIsAssessing(false);
    }
  };

  const resetForm = () => {
    setAudioFile(null);
    setImageFile(null);
    setAdditionalNotes('');
    setReportResult(null);
    setError('');
    setSeverityResult(null);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <Shield className="header-icon" />
            <h1 className="main-title">
              Safe Voice - Incident Report Generator
            </h1>
          </div>
          <p className="subtitle">
            Your voice matters. Document incidents with confidence and dignity.
          </p>
          <div className="empowerment-message">
            <span>🌸</span>
            <span>Empowering women through secure documentation</span>
            <span>🌸</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="form-container">
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Audio Upload */}
          <div className="upload-section">
            <label className="section-label">
              <Mic className="label-icon mic-icon" />
              Audio Evidence (Optional)
            </label>
            <div
              className={`upload-area ${dragActive.audio ? 'drag-active' : ''} ${audioFile ? 'file-uploaded' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'audio')}
              onDragLeave={(e) => handleDrag(e, 'audio')}
              onDragOver={(e) => handleDrag(e, 'audio')}
              onDrop={(e) => handleDrop(e, 'audio')}
            >
              <input
                type="file"
                accept="audio/*,.wav,.mp3"
                onChange={(e) => handleFileUpload(e.target.files[0], 'audio')}
                className="hidden-input"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="upload-label">
                {audioFile ? (
                  <div className="file-success">
                    <CheckCircle className="success-icon" />
                    <span className="file-name">{audioFile.name}</span>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <Upload className="upload-icon" />
                    <p className="upload-text">
                      Drop audio file here or <span className="browse-text">browse</span>
                    </p>
                    <p className="file-info">Supports .wav, .mp3 files</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="upload-section">
            <label className="section-label">
              <Image className="label-icon image-icon" />
              Screenshot Evidence (Optional)
            </label>
            <div
              className={`upload-area ${dragActive.image ? 'drag-active image-drag' : ''} ${imageFile ? 'file-uploaded' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'image')}
              onDragLeave={(e) => handleDrag(e, 'image')}
              onDragOver={(e) => handleDrag(e, 'image')}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                className="hidden-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                {imageFile ? (
                  <div className="file-success">
                    <CheckCircle className="success-icon" />
                    <span className="file-name">{imageFile.name}</span>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <Upload className="upload-icon image-upload-icon" />
                    <p className="upload-text">
                      Drop image here or <span className="browse-text image-browse">browse</span>
                    </p>
                    <p className="file-info">Supports .jpg, .png, .gif files</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="notes-section">
            <label className="section-label">
              <FileText className="label-icon notes-icon" />
              Your Voice - Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Share your experience in your own words. Include date, time, location, people involved, and any other details you feel are important. Your voice is powerful and valid."
              className="notes-textarea"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="generate-button"
            >
              {isGenerating ? (
                <>
                  <Loader className="button-icon spinning" />
                  Creating Your Report...
                </>
              ) : (
                <>
                  <FileText className="button-icon" />
                  Generate My Report
                </>
              )}
            </button>
            
            <button
              onClick={resetForm}
              className="reset-button"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Results */}
        {reportResult && (
          <div className="results-container">
            <div className="results-header">
              <CheckCircle className="results-icon" />
              <h2 className="results-title">
                Your Report is Ready ✨
              </h2>
            </div>

            <div className="success-message">
              <p>
                🌟 You've taken a brave and important step. Your voice matters and your experience is valid. 🌟
              </p>
            </div>

            {/* Preview Sections */}
            <div className="preview-sections">
              {reportResult.audio_text_preview && (
                <div className="preview-section audio-preview">
                  <h3 className="preview-title">
                    <Mic className="preview-icon" />
                    Audio Transcript Preview:
                  </h3>
                  <p className="preview-text">{reportResult.audio_text_preview}</p>
                </div>
              )}

              {reportResult.screenshot_text_preview && (
                <div className="preview-section image-preview">
                  <h3 className="preview-title">
                    <Image className="preview-icon" />
                    Screenshot Text Preview:
                  </h3>
                  <p className="preview-text">{reportResult.screenshot_text_preview}</p>
                </div>
              )}

              <div className="preview-section report-preview">
                <h3 className="preview-title">
                  <FileText className="preview-icon" />
                  Generated Report Preview:
                </h3>
                <p className="preview-text report-text">{reportResult.narrative_preview}</p>
              </div>
            </div>

            {/* Severity Assessment Result */}
            {severityResult && (
              <div className={`severity-result severity-${severityResult.severity.toLowerCase()}`}>
                <h3 className="severity-title">
                  AI Severity Assessment: {severityResult.severity}
                </h3>
                <p className="severity-rationale">
                  <strong>Rationale:</strong> {severityResult.rationale}
                </p>
                {severityResult.actions_taken && severityResult.actions_taken.length > 0 && (
                  <div className="severity-actions">
                    <strong>Actions Taken:</strong>
                    <ul>
                      {severityResult.actions_taken.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="report-actions">
              <button
                onClick={downloadReport}
                className="download-button"
              >
                <Download className="button-icon" />
                Download Your Complete Report Package 📋
              </button>
              
              <button
                onClick={() => {
                  if (severityResult?.severity === 'MODERATE') {
                    setShowHrModal(true);
                  } else {
                    assessSeverity();
                  }
                }}
                disabled={isAssessing}
                className="ai-decision-button"
              >
                {isAssessing ? (
                  <>
                    <Loader className="button-icon spinning" />
                    Assessing Severity...
                  </>
                ) : (
                  <>
                    <Shield className="button-icon" />
                    AI Decision Assistance
                  </>
                )}
              </button>
            </div>

            <p className="download-info">
              📦 Your download includes the formatted report document and all uploaded evidence files. 
              <br />
              <span className="encouragement">Keep this safe - you've got this! 💪</span>
            </p>
          </div>
        )}

        {/* HR Selection Modal */}
        {showHrModal && (
          <div className="modal-overlay">
            <div className="hr-modal">
              <h3>Select HR Representative</h3>
              <div className="hr-options">
                <label>
                  <input 
                    type="radio" 
                    name="hr-email" 
                    value="bluecndy18@gmail.com" 
                    checked={hrEmail === 'bluecndy18@gmail.com'}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                  Primary HR (bluecndy18@gmail.com)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="hr-email" 
                    value="hr2@example.com" 
                    checked={hrEmail === 'hr2@example.com'}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                  Secondary HR (hr2@example.com)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="hr-email" 
                    value="hr3@example.com" 
                    checked={hrEmail === 'hr3@example.com'}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                  HR Manager (hr3@example.com)
                </label>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowHrModal(false);
                    assessSeverity();
                  }}
                  className="confirm-button"
                >
                  Confirm and Proceed
                </button>
                <button 
                  onClick={() => setShowHrModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportGenerator;