// frontend/src/pages/editpage.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
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
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const canvasRef = useRef(null);
  
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Character Diagram");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [relationshipType, setRelationshipType] = useState("generic");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

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
    clearSelection,
    setElements,
    getRelationshipStats
  } = useElementManager(canvasRef);

  const {
    activeTool,
    isErasing,
    relationshipMode,
    zoomLevel,
    setTool,
    toggleEdit,
    toggleEraser,
    toggleRelationshipMode,
    handleZoomIn,
    handleZoomOut  } = useToolManager();

  // Count characters for relationship mode

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  // Load project if editing existing project
  useEffect(() => {
    const loadProject = async () => {
      if (projectId && isLoggedIn) {
        setIsLoading(true);
        try {
          const response = await projectAPI.getProject(projectId);
          const project = response.data.data || response.data;
          
          setCurrentProject(project);
          setProjectName(project.title);
          
          // Parse project data if it exists
          if (project.project_data) {
            let projectData;
            if (typeof project.project_data === 'string') {
              projectData = JSON.parse(project.project_data);
            } else {
              projectData = project.project_data;
            }
            
            if (projectData.elements) {
              setElements(projectData.elements);
            }
          }
          
          setUnsavedChanges(false);
        } catch (error) {
          console.error('Error loading project:', error);
          alert('Failed to load project. You may not have permission to edit this project.');
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProject();
  }, [projectId, isLoggedIn, navigate, setElements]);

  // Track unsaved changes
  useEffect(() => {
    if (currentProject) {
      setUnsavedChanges(true);
    }
  }, [elements, projectName]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentProject || !unsavedChanges) return;

    const autoSaveInterval = setInterval(async () => {
      if (unsavedChanges && elements.length > 0) {
        try {
          await projectAPI.autoSave(currentProject.id, elements);
          console.log('Auto-saved project');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentProject, unsavedChanges, elements]);

  useEffect(() => {
    // Handle escape key to clear selection
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearSelection();
        if (isErasing) toggleEraser();
        if (relationshipMode) toggleRelationshipMode();
      }
      
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
        if (e.key === 'd') {
          e.preventDefault();
          if (selectedElement) {
            updateElement(selectedElement.id);
          }
        }
      }
    };
    
    // Handle clicks outside the canvas
    const handleClickOutside = (event) => {
      const isToolbarClick = event.target.closest('.toolbar');
      const isPropertyPanelClick = event.target.closest('.property-panel');
      
      if (!isToolbarClick && !isPropertyPanelClick &&
          !canvasRef.current?.contains(event.target)) {
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
  }, [isErasing, relationshipMode, unsavedChanges, clearSelection, toggleEraser, toggleRelationshipMode, selectedElement]);

  // Handle saving the project
  const handleSave = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to save projects.');
      return;
    }

    setIsSaving(true);
    try {
      const projectData = {
        elements,
        metadata: {
          version: "1.0",
          updatedAt: new Date().toISOString(),
          stats: getRelationshipStats()
        }
      };

      if (currentProject) {
        // Update existing project
        const updates = {
          title: projectName,
          project_data: JSON.stringify(projectData)
        };
        
        await projectAPI.updateProject(currentProject.id, updates);
        await projectAPI.saveProjectData(currentProject.id, projectData);
        
        alert('Project saved successfully!');
      } else {
        // Create new project
        const newProjectData = {
          title: projectName,
          description: null,
          project_data: JSON.stringify(projectData)
        };
        
        const response = await projectAPI.createProject(newProjectData);
        const newProject = response.data.data || response.data;
        setCurrentProject(newProject);
        
        // Update URL to include project ID
        navigate(`/edit/${newProject.id}`, { replace: true });
        
        alert('Project created and saved successfully!');
      }
      
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle loading a project (placeholder for file upload)
  const handleLoad = () => {
    navigate('/');
  };

  // Toggle functions to manage dropdown state
  const handleToggleEdit = () => {
    setIsEditDropdownOpen(!isEditDropdownOpen);
    setIsStyleDropdownOpen(false);
    toggleEdit();
  };


  const handleCanvasClick = () => {
    setIsEditDropdownOpen(false);
    setIsStyleDropdownOpen(false);
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

  // Enhanced handleSelectElement to pass relationshipType
  const enhancedHandleSelectElement = (id, options = {}) => {
    handleSelectElement(id, { ...options, relationshipType });
  };

  if (isLoading) {
    return (
      <div className="edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

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
          relationshipMode={relationshipMode}
          zoomLevel={zoomLevel}
          setTool={setTool}
          toggleEdit={handleToggleEdit}
          toggleRelationshipMode={toggleRelationshipMode}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          onSave={handleSave}
          onLoad={handleLoad}
          isSaving={isSaving}
          unsavedChanges={unsavedChanges}
        />
      </div>
      
      <EditDropdown 
        isOpen={isEditDropdownOpen}
        addElement={handleAddElement} 
      />

      <RelationshipLayer
        elements={elements}
        selectedElements={selectedElements}
        handleSelectElement={enhancedHandleSelectElement}
        updateElement={updateElement}
        removeElement={removeElement}
      />

      <StyleDropdown 
        isOpen={isStyleDropdownOpen}
        selectedElement={selectedElement} 
        relationshipType={relationshipType}
        setRelationshipType={setRelationshipType}
      />
      
      <div className="main-content">
        <Canvas 
          canvasRef={canvasRef}
          elements={elements} 
          selectedElements={selectedElements}
          zoomLevel={zoomLevel}
          isErasing={isErasing}
          relationshipMode={relationshipMode}
          handleSelectElement={enhancedHandleSelectElement}
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
      
      {/* Status bar - removed */}
    </div>
  );
}

export default EditPage;