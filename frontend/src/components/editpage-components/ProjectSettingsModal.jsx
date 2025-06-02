/* eslint-disable react/prop-types */
// frontend/src/components/editpage-components/ProjectSettingsModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CoverImageUpload from './CoverImageUpload';
import './coverimage.css';

function ProjectSettingsModal({ 
  isOpen, 
  onClose, 
  project, 
  onSave,
  isLoading 
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title || 'Untitled Character Diagram');
      setDescription(project.description || '');
      setCoverImage(project.cover_image || null);
      setHasChanges(false);
    }
  }, [project]);

  useEffect(() => {
    // Check if any field has changed
    if (project) {
      const changed = 
        title !== (project.title || 'Untitled Character Diagram') ||
        description !== (project.description || '') ||
        coverImage !== (project.cover_image || null);
      setHasChanges(changed);
    }
  }, [title, description, coverImage, project]);

  const handleSave = async () => {
    const updates = {
      title: title.trim() || 'Untitled Character Diagram',
      description: description.trim() || null,
      cover_image: coverImage
    };
    
    await onSave(updates);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    if (project) {
      setTitle(project.title || 'Untitled Character Diagram');
      setDescription(project.description || '');
      setCoverImage(project.cover_image || null);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="project-settings-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Cover Image Section */}
          <div className="settings-section">
            <h3 className="section-title">Cover Image</h3>
            <CoverImageUpload
              coverImage={coverImage}
              onImageChange={setCoverImage}
              isLoading={isLoading}
            />
          </div>

          {/* Project Details Section */}
          <div className="settings-section">
            <h3 className="section-title">Project Details</h3>
            
            <div className="form-group">
              <label htmlFor="project-title">Project Title</label>
              <input
                id="project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                maxLength={255}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Description (Optional)</label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your character diagram..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="modal-btn cancel-btn" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="modal-btn save-btn" 
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectSettingsModal;