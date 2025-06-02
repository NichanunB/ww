/* eslint-disable react/prop-types */
// frontend/src/components/editpage-components/Toolbar.jsx
import '../styles/editpage.css';
import { 
  Pen, 
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Save,
  Link,
  Loader,
  Settings
} from "lucide-react";

function Toolbar({ 
  activeTool,
  relationshipMode,
  zoomLevel,
  setTool,
  toggleEdit,
  toggleRelationshipMode,
  handleZoomIn,
  handleZoomOut,
  onSave,
  onLoad,
  onOpenSettings,
  isSaving,
  unsavedChanges
}) {
  return (
    <div className="toolbar">
      <button 
        className="tool-button folder-icon" 
        title="Back to Home"
        onClick={onLoad}
      >
        <FolderOpen size={24} />
      </button>
      
      <button 
        className={`tool-button save-icon ${unsavedChanges ? 'unsaved' : ''}`}
        title={unsavedChanges ? "Save (Unsaved changes)" : "Save"}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? <Loader size={24} className="spinning" /> : <Save size={24} />}
      </button>
      
      <div className="toolbar-divider"></div>
      
      <button 
        className={`tool-button cursor-icon ${activeTool === 'cursor' ? 'active' : ''}`}
        onClick={() => setTool('cursor')}
        title="Select"
      >
        <MousePointer size={24} />
      </button>
      
      <button 
        className={`tool-button edit-icon ${activeTool === 'edit' ? "active" : ""}`} 
        onClick={toggleEdit}
        title="Add Elements"
      >
        <Pen size={24} />
      </button>
      
      <button 
        className={`tool-button relationship-icon ${relationshipMode ? "active" : ""}`} 
        onClick={toggleRelationshipMode}
        title="Create Relationship Between Characters"
      >
        <Link size={24} />
      </button>
      
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
      
      {/* Settings button */}
      <button 
        className="tool-button settings-icon" 
        onClick={onOpenSettings}
        title="Project Settings"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}

export default Toolbar;