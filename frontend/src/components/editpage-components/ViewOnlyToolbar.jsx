/* eslint-disable react/prop-types */
// frontend/src/components/editpage-components/ViewOnlyToolbar.jsx
import '../styles/editpage.css';
import { 
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  Eye,
  Edit3
} from "lucide-react";

function ViewOnlyToolbar({ 
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  onBackToHome,
  onEditProject,
  isOwner
}) {
  return (
    <div className="toolbar view-only-toolbar">
      <button 
        className="tool-button folder-icon" 
        title="Back to Home"
        onClick={onBackToHome}
      >
        <FolderOpen size={24} />
      </button>
      
      {/* ✅ Edit button - only show for owners */}
      {isOwner && onEditProject && (
        <button 
          className="tool-button edit-project-btn"
          title="Edit this project"
          onClick={onEditProject}
        >
          <Edit3 size={24} />
        </button>
      )}
      
      <div className="toolbar-divider"></div>
      
      {/* ✅ View mode indicator */}
      <div className="view-mode-indicator">
        <Eye size={20} />
        <span>View Mode</span>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <button 
        className="tool-button zoomOut-icon" 
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <ZoomOut size={24} />
      </button>
      
      <div className="zoom-level">
        {Math.round(zoomLevel * 100)}%
      </div>
      
      <button 
        className="tool-button zoomIn-icon" 
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <ZoomIn size={24} />
      </button>
    </div>
  );
}

export default ViewOnlyToolbar;