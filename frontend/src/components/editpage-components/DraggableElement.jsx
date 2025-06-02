import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import { getCharacterTypeStyles } from '../../utils/helpers';
import '../styles/editpage.css';

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
           className="text-box"
           value={element.text || ''}
           onChange={(e) => {
             updateElement(element.id, {
               text: e.target.value,
               height: e.target.scrollHeight // ✅ ปรับขนาดตามเนื้อหา
             });
           }}
           onClick={(e) => e.stopPropagation()}
           placeholder="Enter text here..."
           style={{
             height: element.height ? `${element.height}px` : 'auto',
             color: element.color || '#000000', // ✅ สีข้อความ
             width: element.width ? `${element.width}px` : 'auto',
              resize: 'none', // ✅ ปิดการปรับขนาด
              overflow: 'auto',
              padding: '8px',
              border:isSelected ? '2px solid #1677ff' : '1px solid #ccc',
              borderRadius: '4px',
              
        
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
  onClick={(e) => {
    e.stopPropagation(); // <-- ป้องกัน bubble ไป canvas
    handleSelectElement(element.id);
  }}
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

export default DraggableElement;