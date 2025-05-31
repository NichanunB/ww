import React from 'react';
import '../styles/editpage.css';
import { 
  Pen, 
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Eraser, 
  Plus,
  Save,
  Link
} from "lucide-react";

function Toolbar({ 
  activeTool,
  isErasing,
  relationshipMode,
  zoomLevel,
  setTool,
  toggleEdit,
  toggleStyle,
  toggleEraser,
  toggleRelationshipMode,
  handleZoomIn,
  handleZoomOut,
  setRelationshipType,
  relationshipType
}) {
  return (
    <div className="toolbar">
      <button 
        className="tool-button folder-icon" 
        title="Open File"
      >
        <FolderOpen size={24} />
      </button>
      
      <button 
        className="tool-button save-icon" 
        title="Save"
      >
        <Save size={24} />
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
      
      {/* <button 
        className={`tool-button style-icon ${activeTool === 'style' ? "active" : ""}`} 
        onClick={toggleStyle}
        title="Choose Character Style"
      >
        <Plus size={24} />
      </button> */}
      
      <button 
        className={`tool-button relationship-icon ${relationshipMode ? "active" : ""}`} 
        onClick={toggleRelationshipMode}
        title="Create Relationship Between Characters"
      >
        <Link size={24} />
      </button>
      {relationshipMode && (
        <select 
          value={relationshipType} 
          onChange={(e) => setRelationshipType(e.target.value)}
        >
          <option value="generic">Generic</option>
          <option value="child-of">Child of</option>
        </select>
      )}



      
      {/* <button 
        className={`tool-button eraser-icon ${isErasing ? "active eraser-active" : ""}`} 
        onClick={toggleEraser}
        title="Erase Elements"
      >
        <Eraser size={24} />
      </button> */}
      
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

export default Toolbar;