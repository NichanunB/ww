import React, { useEffect, useRef, useState } from 'react';
import '../components/styles/editpage.css';

// Hooks
import useElementManager from '../hooks/useElementManager';
import useToolManager from '../hooks/useToolManager';

// Components
import ProjectName from '../components/editpage-components/ProjectName';
import Toolbar from '../components/editpage-components/Toolbar';
import EditDropdown from '../components/editpage-components/EditDropdown';
import StyleDropdown from '../components/editpage-components/RelationDropdown';
import Canvas from '../components/editpage-components/Canvas';
import PropertyPanel from '../components/editpage-components/PropertyPanel';
import RelationshipLayer from '../components/editpage-components/RelationshipLayer';

function EditPage() {
  const canvasRef = useRef(null);
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Character Diagram");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [relationshipType, setRelationshipType] = useState("generic");

  
  const {
    elements,
    selectedElements,
    selectedElement,
    handleSelectElement,
    addElement,
    updateElement,
    removeElement,
    createRelationship,
    toggleElementVisibility,
    triggerImageUpload,
    saveProject,
    loadProject,
    clearSelection
  } = useElementManager(canvasRef);

  const {
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
    resetZoom
  } = useToolManager();

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(true);
  }, [elements]);

  useEffect(() => {
    // Initialize canvas and setup global event handlers
    
    // Handle escape key to clear selection

    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearSelection();
        // Also exit any special modes
        if (isErasing) toggleEraser();
        if (relationshipMode) toggleRelationshipMode();
      }
      
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'z') {
          // Undo functionality could be implemented here
        }
      }
    };
    
    // Handle clicks outside the canvas
    const handleClickOutside = (event) => {
      const isToolbarClick = event.target.closest('.toolbar');
      const isPropertyPanelClick = event.target.closest('.property-panel');
      
      if (!isToolbarClick && !isPropertyPanelClick && 
          !canvasRef.current?.contains(event.target)) {
        // Close dropdowns if clicking outside toolbar and canvas
        setIsEditDropdownOpen(false);
        setIsStyleDropdownOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // Prompt user before leaving with unsaved changes
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isErasing, relationshipMode, unsavedChanges, clearSelection, toggleEraser, toggleRelationshipMode]);

  // Handle saving the project
  const handleSave = () => {
    if (saveProject) {
      const success = saveProject({ name: projectName, elements });
      if (success) {
        setUnsavedChanges(false);
      }
    }
  };

  // Handle loading a project
  const handleLoad = () => {
    const loadedName = loadProject();
    if (loadedName) {
      setProjectName(loadedName);
      setUnsavedChanges(false);
    }
  };

  // Toggle functions to manage dropdown state
  const handleToggleEdit = () => {
    setIsEditDropdownOpen(!isEditDropdownOpen);
    setIsStyleDropdownOpen(false); // Close the other dropdown
    toggleEdit();
  };

  const handleToggleStyle = () => {
    setIsStyleDropdownOpen(!isStyleDropdownOpen);
    setIsEditDropdownOpen(false); // Close the other dropdown
    toggleStyle();
  };

  const handleCanvasClick = () => {
    // Close dropdowns when clicking on canvas
    setIsEditDropdownOpen(false);
    setIsStyleDropdownOpen(false);
    
    // Clear selection if clicking on empty canvas
    // This may need adjustment based on your Canvas component implementation
  };

  // Wrap addElement to close dropdown after adding
  const handleAddElement = (type) => (e) => {
    const newElement = addElement(type)(e);
    setIsEditDropdownOpen(false);
    return newElement;
  };

  // Handle project name change
  const handleProjectNameChange = (newName) => {
    setProjectName(newName);
    setUnsavedChanges(true);
  };

  return (
    <div className="edit-page">
      <div className="top-bar">
        <ProjectName 
          initialName={projectName} 
          onNameChange={handleProjectNameChange}
          unsavedChanges={unsavedChanges}
        />
        
        <Toolbar 
          activeTool={activeTool}
          isErasing={isErasing}
          relationshipMode={relationshipMode}
          zoomLevel={zoomLevel}
          setTool={setTool}
          toggleEdit={handleToggleEdit}
          toggleStyle={handleToggleStyle}
          toggleEraser={toggleEraser}
          toggleRelationshipMode={toggleRelationshipMode}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          resetZoom={resetZoom}
          onSave={handleSave}
          onLoad={handleLoad}
          relationshipType={relationshipType}
          setRelationshipType={setRelationshipType}
         
        />
      </div>
      
      <EditDropdown 
        isOpen={isEditDropdownOpen}
        addElement={handleAddElement} 
      />

      <RelationshipLayer
        elements={elements}
        selectedElements={selectedElements}
        handleSelectElement={handleSelectElement}
        updateElement={updateElement}
        removeElement={removeElement} // ✅ อย่าลืมส่ง
      />

      
      <StyleDropdown 
        isOpen={isStyleDropdownOpen}
        selectedElement={selectedElement} 
        setCharacterType={(id, type) => updateElement(id, { characterType: type })}
      />
      
      <div className="main-content">
        <Canvas 
          canvasRef={canvasRef}
          elements={elements} 
          selectedElements={selectedElements}
          zoomLevel={zoomLevel}
          isErasing={isErasing}
          relationshipMode={relationshipMode}
          handleSelectElement={handleSelectElement}
          updateElement={updateElement}
          createRelationship={createRelationship}
          handleCanvasClick={handleCanvasClick}
        />
        
        {selectedElement && (
          <PropertyPanel 
            selectedElement={selectedElement} 
            updateElement={updateElement} 
            removeElement={removeElement} 
            toggleElementVisibility={toggleElementVisibility} 
            triggerImageUpload={triggerImageUpload} 
          />
        )}
      </div>
      
      {/* Status bar - optional */}
      <div className="status-bar">
        <div className="status-info">
          {relationshipMode && (
            <span className="status-mode">Relationship Mode</span>
          )}
          {isErasing && (
            <span className="status-mode">Eraser Mode</span>
          )}
          <span className="zoom-level">Zoom: {Math.round(zoomLevel * 100)}%</span>
          {selectedElements.length > 0 && (
            <span className="selection-info">
              {selectedElements.length} item{selectedElements.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditPage;