
import React, { useRef } from 'react';

const FileUpload = ({
  files = [],           // ✅ Default empty array
  onChange,
  fileType,
  multiple = true,
  label,
  accept
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (onChange) {
      onChange(selectedFiles);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} bytes`;
    else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / 1048576).toFixed(2)} MB`;
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      <label>{label || 'Upload Files'}</label>
      <div className="file-upload">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={handleClick}>
          Select File{multiple ? 's' : ''}
        </button>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({formatFileSize(file.size)})</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="remove-file-button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
