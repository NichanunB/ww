// frontend/src/pages/projectview.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import '../components/styles/editpage.css';
import '../components/styles/projectview.css';

// Components
import Canvas from '../components/editpage-components/Canvas';
import RelationshipLayer from '../components/editpage-components/RelationshipLayer';
import ReadOnlyPropertyPanel from '../components/editpage-components/ReadOnlyPropertyPanel';
import ViewOnlyToolbar from '../components/editpage-components/ViewOnlyToolbar';

function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const canvasRef = useRef(null);
  
  const [project, setProject] = useState(null);
  const [elements, setElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await projectAPI.getProject(projectId);
        const projectData = response.data.data || response.data;
        setProject(projectData);
        
        if (projectData.project_data) {
          let parsedData;
          if (typeof projectData.project_data === 'string') {
            parsedData = JSON.parse(projectData.project_data);
          } else {
            parsedData = projectData.project_data;
          }
          
          if (parsedData.elements) {
            setElements(parsedData.elements);
          }
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project. It may be private or not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const isOwner = isLoggedIn && user && project && project.user_id === user.id;

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleEditProject = () => {
    if (isOwner) {
      navigate(`/edit/${projectId}`);
    }
  };

  // ✅ Handle element selection for viewing properties (read-only)
  const handleElementSelect = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    setSelectedElement(element);
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

  if (error) {
    return (
      <div className="edit-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackToHome} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page project-view-mode">
      {/* ✅ View-Only Banner */}
      {!isOwner && (
        <div className="view-only-banner">
          <span>👁️ View Only Mode - No editing allowed</span>
        </div>
      )}

      {/* ✅ Project Title Bar */}
      <div className="top-bar">
        <div className="project-name-container">
          <h2 className="project-name-text">{project?.title || 'Untitled Character Diagram'}</h2>
        </div>
        
        {/* ✅ View-Only Toolbar */}
        <ViewOnlyToolbar 
          zoomLevel={zoomLevel}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          onBackToHome={handleBackToHome}
          onEditProject={isOwner ? handleEditProject : null}
          isOwner={isOwner}
        />
      </div>
      
      <div className="main-content">
        <Canvas 
          canvasRef={canvasRef}
          elements={elements} 
          selectedElements={selectedElement ? [selectedElement.id] : []}
          zoomLevel={zoomLevel}
          isErasing={false}
          relationshipMode={false}
          handleSelectElement={handleElementSelect}
          updateElement={() => {}} // ✅ ปิดการแก้ไข
          createRelationship={() => {}} // ✅ ปิดการสร้าง relationship
          handleCanvasClick={() => setSelectedElement(null)}
        />

        <RelationshipLayer
          elements={elements}
          selectedElements={selectedElement ? [selectedElement.id] : []}
          handleSelectElement={handleElementSelect}
          updateElement={() => {}} // ✅ ปิดการแก้ไข
          removeElement={() => {}} // ✅ ปิดการลบ
        />
        
        {/* ✅ Read-Only Property Panel */}
        {selectedElement && (
          <ReadOnlyPropertyPanel 
            selectedElement={selectedElement}
            projectAuthor={project?.authorName || 'Unknown Author'}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectView;