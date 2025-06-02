/* eslint-disable react/prop-types */
// frontend/src/components/editpage-components/ReadOnlyPropertyPanel.jsx

import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css'; 

const ReadOnlyPropertyPanel = ({ selectedElement, projectAuthor }) => {
  if (!selectedElement) return null;
  
  // Function to render read-only fields based on element type
  const renderFields = () => {
    switch (selectedElement.type) {
      case ELEMENT_TYPES.CIRCLE:
        return (
          <>
            <div className="readonly-field">
              <label>Name/Text:</label>
              <div className="readonly-value">{selectedElement.text || 'Unnamed Character'}</div>
            </div>

            <div className="readonly-field">
              <label>Character Type:</label>
              <div className="readonly-value character-type">
                <span className={`type-badge ${selectedElement.characterType || 'neutral'}`}>
                  {selectedElement.characterType || 'neutral'}
                </span>
              </div>
            </div>
            
            {selectedElement.details && (
              <div className="readonly-field">
                <label>Details:</label>
                <div className="readonly-value">{selectedElement.details}</div>
              </div>
            )}
            
            {selectedElement.age && (
              <div className="readonly-field">
                <label>Age:</label>
                <div className="readonly-value">{selectedElement.age}</div>
              </div>
            )}
            
            <div className="readonly-field">
              <label>Element ID:</label>
              <div className="readonly-value element-id">{selectedElement.id}</div>
            </div>

            {selectedElement.profileImage && (
              <div className="readonly-field">
                <label>Profile Image:</label>
                <div className="readonly-image">
                  <img 
                    src={selectedElement.profileImage} 
                    alt="Character Profile" 
                    className="readonly-profile-image"
                  />
                </div>
              </div>
            )}
          </>
        );
        
      case ELEMENT_TYPES.TEXTBOX:
        return (
          <>
            <div className="readonly-field">
              <label>Text Content:</label>
              <div className="readonly-value text-content">
                {selectedElement.text || 'Empty text box'}
              </div>
            </div>

            <div className="readonly-field">
              <label>Font Size:</label>
              <div className="readonly-value">{selectedElement.fontSize || 14}px</div>
            </div>
        
            <div className="readonly-field">
              <label>Dimensions:</label>
              <div className="readonly-value">
                {selectedElement.width || 150} × {selectedElement.height || 100} px
              </div>
            </div>

            <div className="readonly-field">
              <label>Element ID:</label>
              <div className="readonly-value element-id">{selectedElement.id}</div>
            </div>
          </>
        );
        
      case ELEMENT_TYPES.RELATIONSHIP:
        return (
          <>
            <div className="readonly-field">
              <label>Relationship Label:</label>
              <div className="readonly-value">{selectedElement.text || 'Unlabeled relationship'}</div>
            </div>
            
            <div className="readonly-field">
              <label>Relationship Type:</label>
              <div className="readonly-value">
                <span className={`type-badge ${selectedElement.relationshipType || 'generic'}`}>
                  {selectedElement.relationshipType || 'generic'}
                </span>
              </div>
            </div>

            <div className="readonly-field">
              <label>Connection:</label>
              <div className="readonly-value">
                From: {selectedElement.sourceId} → To: {selectedElement.targetId}
              </div>
            </div>

            <div className="readonly-field">
              <label>Element ID:</label>
              <div className="readonly-value element-id">{selectedElement.id}</div>
            </div>
          </>
        );
        
      default:
        return <p>Unknown element type</p>;
    }
  };
  
  return (
    <div className="property-panel readonly-panel">
      <h3>Details (Read Only)</h3>
      
      <div className="element-type-label readonly">
        {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
      </div>
      
      {renderFields()}

      {/* ✅ Project info at bottom */}
      <div className="readonly-project-info">
        <div className="readonly-field">
          <label>Project Author:</label>
          <div className="readonly-value author-name">{projectAuthor}</div>
        </div>
        
        <div className="readonly-disclaimer">
          <p>All properties are displayed in read-only mode.</p>
          <p>No modifications can be made.</p>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyPropertyPanel;