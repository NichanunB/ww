// DONT USE THIS FILE, USE editpage.jsx INSTEAD
// This file is a copy of editpage.jsx for testing purposes

import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import '../components/styles/editpage.css';
import { 
  Pen, 
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Eraser, 
  RotateCcw,
  Plus,
  Save,
  Link,
  Trash2,
  Image,
  Eye,
  EyeOff
} from "lucide-react";

// Element type constants for better maintainability
const ELEMENT_TYPES = {
  CIRCLE: 'circle',
  LINE: 'line',
  TEXTBOX: 'textbox',
  IMAGE: 'image',
  RELATIONSHIP: 'relationship'
};

// Character types for styling
// const CHARACTER_TYPES = {
//   HERO: 'hero',
//   VILLAIN: 'villain',
//   SUPPORTER: 'supporter',
//   NEUTRAL: 'neutral'
// };

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

function EditPage() {
  // State management
  const [editOpen, setEditOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [elements, setElements] = useState([]);
  const [activeTool, setActiveTool] = useState('cursor');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedElements, setSelectedElements] = useState([]);
  const [relationshipMode, setRelationshipMode] = useState(false);
  
  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Derived state
  const isErasing = activeTool === 'eraser';
  const selectedElement = elements.find(el => selectedElements[0] === el.id);
  
  // Element management functions
  const addElement = (type) => (e) => {
    e.preventDefault();
    const newElement = { 
      id: generateId(),
      type, 
      x: Math.floor(Math.random() * 200) + 200, // Randomize position a bit
      y: Math.floor(Math.random() * 100) + 100,
      width: type === ELEMENT_TYPES.LINE ? 100 : undefined,
      height: type === ELEMENT_TYPES.TEXTBOX ? 100 : undefined,
      rotation: 0,
      color: '#000000',
      text: '',
      characterType: CHARACTER_TYPES.NEUTRAL,
      occupation: '',
      age: '',
      profileImage: null,
      hidden: false
    };
    
    setElements([...elements, newElement]);
    setSelectedElements([newElement.id]);
    setEditOpen(false);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(element => 
      element.id === id ? { ...element, ...updates } : element
    ));
  };

  const removeElement = (id) => {
    // Remove the element itself
    setElements(elements.filter(element => element.id !== id));
    
    // Also remove any relationships connected to this element
    setElements(prevElements => 
      prevElements.filter(element => 
        element.type !== ELEMENT_TYPES.RELATIONSHIP || 
        (element.sourceId !== id && element.targetId !== id)
      )
    );
    
    // Update selection state
    setSelectedElements(prev => prev.filter(selectedId => selectedId !== id));
  };

  // Tool management
  const setTool = (tool) => {
    setActiveTool(tool);
    if (tool !== 'edit') {
      setEditOpen(false);
    }
    if (tool !== 'style') {
      setStyleOpen(false);
    }
    if (tool !== 'relationship') {
      setRelationshipMode(false);
      setSelectedElements([]);
    }
  };

  const toggleEdit = () => {
    setEditOpen(!editOpen);
    setStyleOpen(false);
    setActiveTool('edit');
  };

  const toggleStyle = () => {
    setStyleOpen(!styleOpen);
    setEditOpen(false);
    setActiveTool('style');
  };

  const toggleEraser = () => {
    setTool(activeTool === 'eraser' ? 'cursor' : 'eraser');
  };

  const toggleRelationshipMode = () => {
    setRelationshipMode(!relationshipMode);
    setTool(relationshipMode ? 'cursor' : 'relationship');
    setSelectedElements([]);
  };

  // Image handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedElement) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateElement(selectedElement.id, { profileImage: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Canvas operations
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleSelectElement = (id) => {
    if (isErasing) {
      removeElement(id);
      return;
    }
    
    const element = elements.find(el => el.id === id);
    
    // Handling relationship mode
    if (relationshipMode && element && element.type === ELEMENT_TYPES.CIRCLE) {
      if (selectedElements.includes(id)) {
        // Deselect if already selected
        setSelectedElements(prev => prev.filter(selectedId => selectedId !== id));
      } else {
        // Add to selection or replace single selection
        const newSelection = [...selectedElements, id].slice(-2); // Keep only last 2 selections
        setSelectedElements(newSelection);
        
        // If we have 2 circles selected, create a relationship
        if (newSelection.length === 2) {
          const [sourceId, targetId] = newSelection;
          
          // Check if both are circles
          const source = elements.find(el => el.id === sourceId);
          const target = elements.find(el => el.id === targetId);
          
          if (source.type === ELEMENT_TYPES.CIRCLE && target.type === ELEMENT_TYPES.CIRCLE) {
            // Create relationship
            createRelationship(sourceId, targetId);
            // Reset selection
            setSelectedElements([]);
          }
        }
      }
    } else if (activeTool === 'cursor') {
      // Normal selection mode (single selection)
      if (selectedElements.includes(id)) {
        setSelectedElements([]);
      } else {
        setSelectedElements([id]);
      }
    }
  };

  const setCharacterType = (id, characterType) => {
    updateElement(id, { characterType });
    setStyleOpen(false);
  };

  const createRelationship = (sourceId, targetId) => {
    // Check if a relationship already exists between these elements
    const relationshipExists = elements.some(el => 
      el.type === ELEMENT_TYPES.RELATIONSHIP && 
      ((el.sourceId === sourceId && el.targetId === targetId) || 
       (el.sourceId === targetId && el.targetId === sourceId))
    );
    
    if (relationshipExists) {
      return; // Don't create duplicate relationships
    }
    
    const newRelationship = {
      id: generateId(),
      type: ELEMENT_TYPES.RELATIONSHIP,
      sourceId,
      targetId,
      text: "",
      color: "#1677ff",
      hidden: false
    };
    
    setElements([...elements, newRelationship]);
  };

  // Toggle visibility of a relationship
  const toggleRelationshipVisibility = (id) => {
    updateElement(id, { hidden: !selectedElement.hidden });
  };

  // Calculate relationship line positions
  const calculateRelationshipPosition = (relationship) => {
    const source = elements.find(el => el.id === relationship.sourceId);
    const target = elements.find(el => el.id === relationship.targetId);
    
    if (!source || !target) return null;
    
    // Find center of circles
    const sourceX = source.x + 40; // Half width of circle
    const sourceY = source.y + 40; // Half height of circle
    const targetX = target.x + 40;
    const targetY = target.y + 40;
    
    return {
      x1: sourceX,
      y1: sourceY,
      x2: targetX,
      y2: targetY
    };
  };

  // Handle clicks outside of edit dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editOpen && !e.target.closest('.edit-icon') && !e.target.closest('.edit-dropdown')) {
        setEditOpen(false);
      }
      if (styleOpen && !e.target.closest('.style-icon') && !e.target.closest('.style-dropdown')) {
        setStyleOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editOpen, styleOpen]);

  // Handle canvas click to deselect
  const handleCanvasClick = (e) => {
    // Only deselect if clicking directly on the canvas, not on any element
    if (e.target === canvasRef.current) {
      setSelectedElements([]);
    }
  };

  // Parent relationship mode state change
  // useEffect(() => {
  //   if (!relationshipMode) {
  //     setSelectedElements([]);
  //   }
  // }, [relationshipMode]);

  return (
    <div className={`edit-page ${isErasing ? "eraser-mode" : ""} ${relationshipMode ? "relationship-mode" : ""}`}>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageUpload}
      />
      
      {/* Toolbar */}
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
        
        <button 
          className={`tool-button style-icon ${activeTool === 'style' ? "active" : ""}`} 
          onClick={toggleStyle}
          title="Choose Character Style"
        >
          <Plus size={24} />
        </button>
        
        <button 
          className={`tool-button relationship-icon ${relationshipMode ? "active" : ""}`} 
          onClick={toggleRelationshipMode}
          title="Create Relationship Between Characters"
        >
          <Link size={24} />
        </button>
        
        <button 
          className={`tool-button eraser-icon ${isErasing ? "active eraser-active" : ""}`} 
          onClick={toggleEraser}
          title="Erase Elements"
        >
          <Eraser size={24} />
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
      </div>

      {/* Add Element Dropdown Menu */}
      <div className={`edit-dropdown ${editOpen ? "open" : ""}`}>
        <ul>
          <li>
            <a href="#" onClick={addElement(ELEMENT_TYPES.CIRCLE)}>
              เพิ่มตัวละคร (Add Character)
            </a>
          </li>
          <li>
            <a href="#" onClick={addElement(ELEMENT_TYPES.IMAGE)}>
              เพิ่มรูปภาพ (Add Image)
            </a>
          </li>
          <li>
            <a href="#" onClick={addElement(ELEMENT_TYPES.TEXTBOX)}>
              กล่องข้อความ (Add Text Box)
            </a>
          </li>
        </ul>
      </div>

      {/* Character Style Dropdown Menu */}
      <div className={`style-dropdown ${styleOpen && selectedElement?.type === ELEMENT_TYPES.CIRCLE ? "open" : ""}`}>
        <ul>
          <li>
            <a href="#" onClick={() => selectedElement && setCharacterType(selectedElement.id, CHARACTER_TYPES.HERO)}>
              Hero
            </a>
          </li>
          <li>
            <a href="#" onClick={() => selectedElement && setCharacterType(selectedElement.id, CHARACTER_TYPES.VILLAIN)}>
              Villain
            </a>
          </li>
          <li>
            <a href="#" onClick={() => selectedElement && setCharacterType(selectedElement.id, CHARACTER_TYPES.SUPPORTER)}>
              Supporter
            </a>
          </li>
          <li>
            <a href="#" onClick={() => selectedElement && setCharacterType(selectedElement.id, CHARACTER_TYPES.NEUTRAL)}>
              Neutral
            </a>
          </li>
        </ul>
      </div>

      {/* Relationship Mode Instructions */}
      {relationshipMode && (
        <div className="relationship-instructions">
          <p>Select two characters to create a relationship between them</p>
          {selectedElements.length === 1 && <p>Now select a second character</p>}
        </div>
      )}

      {/* Canvas and Property Panel Container */}
      <div className="main-container">
        <div className="edit-container">
          <h1>Character Relationship Diagram</h1>
          <div 
            className="canvas-area" 
            ref={canvasRef} 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center' 
            }}
            onClick={handleCanvasClick}
          >
            {/* Render relationship lines first (behind elements) */}
            <svg className="relationships-layer">
              {elements
                .filter(element => element.type === ELEMENT_TYPES.RELATIONSHIP && !element.hidden)
                .map(relationship => {
                  const position = calculateRelationshipPosition(relationship);
                  if (!position) return null;
                  
                  const { x1, y1, x2, y2 } = position;
                  
                  // Calculate the midpoint for potential label
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  
                  const isSelected = selectedElements.includes(relationship.id);
                  
                  return (
                    <g key={relationship.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={relationship.color}
                        strokeWidth={isSelected ? 3 : 2}
                        className={`relationship-line ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectElement(relationship.id);
                        }}
                      />
                      {isSelected && (
                        <foreignObject
                          x={midX - 60}
                          y={midY - 15}
                          width={120}
                          height={30}
                          className="relationship-label-container"
                        >
                          <input
                            type="text"
                            value={relationship.text || ''}
                            placeholder="Relationship type"
                            className="relationship-label"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateElement(relationship.id, { text: e.target.value })}
                          />
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
            </svg>
            
            {/* Render draggable elements */}
            {elements
              .filter(element => element.type !== ELEMENT_TYPES.RELATIONSHIP)
              .map((element) => (
                <DraggableElement 
                  key={element.id} 
                  element={element} 
                  isSelected={selectedElements.includes(element.id)}
                  isRelationshipCandidate={relationshipMode && element.type === ELEMENT_TYPES.CIRCLE}
                  isErasing={isErasing} 
                  handleSelectElement={handleSelectElement}
                  updateElement={updateElement} 
                  onDrag={(newX, newY) => {
                    updateElement(element.id, { x: newX, y: newY });
                  }}
                />
              ))}
          </div>
        </div>
        
        {/* Property Panel */}
        {selectedElement && (
          <div className="property-panel">
            <h2>Properties</h2>
            
            {selectedElement.type === ELEMENT_TYPES.CIRCLE && (
              <div className="character-properties">
                <div className="property-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    value={selectedElement.text || ''} 
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })} 
                    placeholder="Character Name"
                  />
                </div>
                
                <div className="property-group">
                  <label>Occupation:</label>
                  <input 
                    type="text" 
                    value={selectedElement.occupation || ''} 
                    onChange={(e) => updateElement(selectedElement.id, { occupation: e.target.value })} 
                    placeholder="Character Occupation"
                  />
                </div>
                
                <div className="property-group">
                  <label>Age:</label>
                  <input 
                    type="text" 
                    value={selectedElement.age || ''} 
                    onChange={(e) => updateElement(selectedElement.id, { age: e.target.value })} 
                    placeholder="Character Age"
                  />
                </div>
                
                <div className="property-group">
                  <label>Character Type:</label>
                  <select 
                    value={selectedElement.characterType} 
                    onChange={(e) => updateElement(selectedElement.id, { characterType: e.target.value })}
                  >
                    <option value={CHARACTER_TYPES.HERO}>Hero</option>
                    <option value={CHARACTER_TYPES.VILLAIN}>Villain</option>
                    <option value={CHARACTER_TYPES.SUPPORTER}>Supporter</option>
                    <option value={CHARACTER_TYPES.NEUTRAL}>Neutral</option>
                  </select>
                </div>
                
                <div className="property-group">
                  <label>Color:</label>
                  <input 
                    type="color" 
                    value={selectedElement.color} 
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} 
                  />
                </div>
                
                <div className="property-group">
                  <label>Profile Image:</label>
                  <div className="image-controls">
                    <button className="image-button" onClick={triggerImageUpload}>
                      <Image size={16} />
                      {selectedElement.profileImage ? 'Change Image' : 'Add Image'}
                    </button>
                    {selectedElement.profileImage && (
                      <button className="image-button" onClick={() => updateElement(selectedElement.id, { profileImage: null })}>
                        Remove Image
                      </button>
                    )}
                  </div>
                  {selectedElement.profileImage && (
                    <div className="profile-preview">
                      <img src={selectedElement.profileImage} alt="Profile" className="profile-thumbnail" />
                    </div>
                  )}
                </div>
                
                <div className="property-group action-buttons">
                  <button className="delete-button" onClick={() => removeElement(selectedElement.id)}>
                    <Trash2 size={16} />
                    Delete Character
                  </button>
                </div>
              </div>
            )}
            
            {selectedElement.type === ELEMENT_TYPES.RELATIONSHIP && (
              <div className="relationship-properties">
                <div className="property-group">
                  <label>Relationship:</label>
                  <input 
                    type="text" 
                    value={selectedElement.text || ''} 
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })} 
                    placeholder="e.g. friend, father-son"
                  />
                </div>
                
                <div className="property-group">
                  <label>Line Color:</label>
                  <input 
                    type="color" 
                    value={selectedElement.color} 
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} 
                  />
                </div>
                
                <div className="property-group">
                  <label>Visibility:</label>
                  <button className="visibility-button" onClick={() => toggleRelationshipVisibility(selectedElement.id)}>
                    {selectedElement.hidden ? (
                      <>
                        <Eye size={16} />
                        Show Connection
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        Hide Connection
                      </>
                    )}
                  </button>
                </div>
                
                <div className="property-group action-buttons">
                  <button className="delete-button" onClick={() => removeElement(selectedElement.id)}>
                    <Trash2 size={16} />
                    Delete Relationship
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableElement({ 
  element, 
  isSelected, 
  isRelationshipCandidate,
  isErasing, 
  handleSelectElement, 
  updateElement,
  onDrag
}) {
  const nodeRef = useRef(null);
  
  const handleTextChange = (e) => {
    updateElement(element.id, { text: e.target.value });
  };

  const handleDragStop = (e, data) => {
    onDrag(data.x, data.y);
  };
  
  const getCharacterTypeStyles = (characterType) => {
    switch(characterType) {
      case CHARACTER_TYPES.HERO:
        return { borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
      case CHARACTER_TYPES.VILLAIN:
        return { borderColor: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
      case CHARACTER_TYPES.SUPPORTER:
        return { borderColor: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
      default: // NEUTRAL
        return { borderColor: '#9E9E9E', backgroundColor: 'rgba(158, 158, 158, 0.1)' };
    }
  };
  
  const getElementContent = () => {
    switch(element.type) {
      case ELEMENT_TYPES.CIRCLE:
        const typeStyles = getCharacterTypeStyles(element.characterType);
        return (
          <div 
            className="circle-content"
            style={{
              borderColor: typeStyles.borderColor,
              backgroundColor: typeStyles.backgroundColor
            }}
          >
            {element.profileImage ? (
              <div className="profile-image-container">
                <img src={element.profileImage} alt={element.text} className="profile-image" />
              </div>
            ) : (
              <div className="profile-placeholder"></div>
            )}
            <span className="character-name">{element.text || 'Character'}</span>
            {element.occupation && <span className="character-occupation">{element.occupation}</span>}
          </div>
        );
        
      case ELEMENT_TYPES.TEXTBOX:
        return (
          <textarea 
            className='text-box' 
            value={element.text || ''} 
            onChange={handleTextChange} 
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter text here..." 
            style={{ 
              height: element.height ? `${element.height}px` : 'auto'
            }}
          />
        );
        
      case ELEMENT_TYPES.IMAGE:
        return (
          <div className="image-placeholder">
            <span>Image Placeholder</span>
            {isSelected && (
              <input 
                type="text" 
                value={element.text || ''} 
                onChange={handleTextChange} 
                onClick={(e) => e.stopPropagation()}
                placeholder="Image caption" 
                className="image-caption-input"
              />
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Draggable 
      nodeRef={nodeRef} 
      position={{ x: element.x, y: element.y }}
      disabled={isErasing}
      onStop={handleDragStop}
    >
      <div 
        ref={nodeRef} 
        className={`element ${element.type} 
                    ${isSelected ? "selected" : ""} 
                    ${isErasing ? "eraser-active" : ""} 
                    ${isRelationshipCandidate ? "relationship-candidate" : ""}`} 
        onClick={() => handleSelectElement(element.id)}
        style={{ 
          transform: `rotate(${element.rotation || 0}deg)`, 
          color: element.color
        }}
      >
        {getElementContent()}
      </div>
    </Draggable>
  );
}

export default EditPage;