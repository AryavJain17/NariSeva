import { getFileIcon } from '../../utils/helpers';

const FilePreview = ({ file, type, onDownload }) => {
  const filename = file.name || file.split('/').pop();
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div className="flex items-center">
        <span className="mr-2">{getFileIcon(type)}</span>
        <span className="text-sm truncate max-w-xs">{filename}</span>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Download
      </button>
    </div>
  );
};

export default FilePreview;