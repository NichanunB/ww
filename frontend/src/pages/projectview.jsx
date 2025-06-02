// frontend/src/pages/projectview.jsx
import  { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import '../components/styles/editpage.css';
import '../components/styles/projectview.css';

// Components (read-only versions)
import Canvas from '../components/editpage-components/Canvas';
import RelationshipLayer from '../components/editpage-components/RelationshipLayer';

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

  const handleEditProject = () => {
    if (isOwner) {
      navigate(`/edit/${projectId}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getDefaultCover = () => {
    const colors = ['#AD8B73', '#CEAB93', '#E3CAA5', '#FFFBE9', '#A8DADC', '#457B9D', '#1D3557'];
    const colorIndex = parseInt(projectId) % colors.length;
    const backgroundColor = colors[colorIndex];

    const titleChar = project?.title?.charAt(0)?.toUpperCase() || 'P';
    const svgCover = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="${backgroundColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="24" fill="white">
          ${titleChar}
        </text>
      </svg>
    `;
    const encoded = encodeURIComponent(svgCover);
    return `data:image/svg+xml;base64,${btoa(unescape(encoded))}`;
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
      {project?.cover_image && (
        <div className="project-cover-header">
          <img 
            src={project.cover_image} 
            alt={project.title}
            onError={(e) => {
              e.target.src = getDefaultCover();
            }}
          />
          <div className="cover-overlay">
            <div className="project-info">
              <h1>{project?.title || 'Untitled Project'}</h1>
              <p className="project-author">
                by {project?.authorName || 'Unknown Author'}
              </p>
              {project?.description && (
                <p className="project-description">{project.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!project?.cover_image && (
        <div className="project-view-header">
          <div className="project-info">
            <h1>{project?.title || 'Untitled Project'}</h1>
            <p className="project-author">
              by {project?.authorName || 'Unknown Author'}
            </p>
            {project?.description && (
              <p className="project-description">{project.description}</p>
            )}
          </div>
          
          <div className="project-actions">
            <button onClick={handleBackToHome} className="action-button">
              ← Back to Home
            </button>
            
            {isOwner && (
              <button onClick={handleEditProject} className="action-button edit-button">
                Edit Project
              </button>
            )}
          </div>
        </div>
      )}

      {project?.cover_image && (
        <div className="project-actions-bar">
          <button onClick={handleBackToHome} className="action-button">
            ← Back to Home
          </button>
          
          {isOwner && (
            <button onClick={handleEditProject} className="action-button edit-button">
              Edit Project
            </button>
          )}
        </div>
      )}

      <div className="view-controls">
        <button onClick={handleZoomOut} className="zoom-button" title="Zoom Out">
          -
        </button>
        <span className="zoom-display">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={handleZoomIn} className="zoom-button" title="Zoom In">
          +
        </button>
      </div>
      
      <div className="main-content view-mode">
        <RelationshipLayer
          elements={elements}
          selectedElements={[]}
          handleSelectElement={() => {}}
          updateElement={() => {}}
          removeElement={() => {}}
        />

        <Canvas 
          canvasRef={canvasRef}
          elements={elements} 
          selectedElements={[]}
          zoomLevel={zoomLevel}
          isErasing={false}
          relationshipMode={false}
          handleSelectElement={() => {}}
          updateElement={() => {}}
          createRelationship={() => {}}
          handleCanvasClick={() => {}}
          readOnly={true}
        />
      </div>
      
      <div className="project-view-info">
        <div className="project-stats">
          <div className="stat">
            <span className="stat-label">Characters:</span>
            <span className="stat-value">
              {elements.filter(el => el.type === 'circle').length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Relationships:</span>
            <span className="stat-value">
              {elements.filter(el => el.type === 'relationship').length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Text Boxes:</span>
            <span className="stat-value">
              {elements.filter(el => el.type === 'textbox').length}
            </span>
          </div>
        </div>
        
        {!isLoggedIn && (
          <div className="login-prompt">
            <p>
              <a href="/login">Login</a> to create your own character diagrams!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectView;
