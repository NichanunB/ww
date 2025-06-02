// frontend/src/components/editpage-components/CoverImageUpload.jsx
import  { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import './coverimage.css';

// eslint-disable-next-line react/prop-types
function CoverImageUpload({ coverImage, onImageChange, isLoading }) {
  const [previewUrl, setPreviewUrl] = useState(coverImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setPreviewUrl(imageData);
      onImageChange(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeCoverImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
  };

  return (
    <div className="cover-image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="cover-image-preview">
          <img src={previewUrl} alt="Cover" />
          <div className="cover-image-overlay">
            <button
              className="cover-action-btn change-btn"
              onClick={triggerFileInput}
              disabled={isLoading}
              title="Change cover image"
            >
              <Camera size={20} />
              Change Cover
            </button>
            <button
              className="cover-action-btn remove-btn"
              onClick={removeCoverImage}
              disabled={isLoading}
              title="Remove cover image"
            >
              <X size={20} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`cover-image-placeholder ${isDragging ? 'dragging' : ''}`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Camera size={48} />
          <p className="upload-text">
            Click to upload or drag and drop
          </p>
          <p className="upload-hint">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
}

export default CoverImageUpload;