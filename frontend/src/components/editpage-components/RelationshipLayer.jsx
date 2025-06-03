/* eslint-disable no-unused-vars */
// frontend/src/components/editpage-components/RelationshipLayer.jsx
import PropTypes from 'prop-types';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css';

function RelationshipLayer({
  elements,
  selectedElements,
  handleSelectElement,
  updateElement,
  removeElement,
  zoomLevel = 1,
  isReadOnly = false
}) {
  const getElementById = (id) => elements.find(el => el.id === id);

  // ✅ ปรับฟังก์ชันคำนวณจุดขอบให้ตรงกับการแสดงผลใน Canvas
  const calculateEdgePoints = (sourceEl, targetEl) => {
    // ใช้ coordinate เดียวกับ Canvas (คูณ zoomLevel ก่อน)
    const sourceCenterX = sourceEl.x * zoomLevel;
    const sourceCenterY = sourceEl.y * zoomLevel;
    const targetCenterX = targetEl.x * zoomLevel;
    const targetCenterY = targetEl.y * zoomLevel;
    
    // คำนวณระยะห่างและมุม
    const dx = targetCenterX *0 - sourceCenterX *0;
    const dy = targetCenterY *0 - sourceCenterY *0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // หลีกเลี่ยงการหารด้วย 0
    if (distance === 0) {
      return {
        x1: sourceCenterX,
        y1: sourceCenterY,
        x2: targetCenterX,
        y2: targetCenterY
      };
    }
    
    const angle = Math.atan2(dy, dx);
    
    // คำนวณ radius ตามขนาดจริงที่แสดงผล (รวม zoomLevel แล้ว)
    let sourceRadius, targetRadius;
    
    if (sourceEl.type === ELEMENT_TYPES.CIRCLE) {
      // สำหรับ Circle: ใช้ radius ตรงๆ ตามที่ Canvas แสดงผล
      sourceRadius = (sourceEl.width / 2) * zoomLevel;
    } else if (sourceEl.type === ELEMENT_TYPES.TEXTBOX) {
      // สำหรับ Textbox: คำนวณระยะจากศูนย์กลางไปขอบ
      const halfWidth = (sourceEl.width / 2) * zoomLevel;
      const halfHeight = (sourceEl.height / 2) * zoomLevel;
      
      // หาจุดที่เส้นตัดกับขอบกรอบ
      const absAngle = Math.abs(angle);
      const cornerAngle = Math.atan2(halfHeight, halfWidth);
      
      if (absAngle <= cornerAngle || absAngle >= Math.PI - cornerAngle) {
        // ตัดขอบซ้าย/ขวา
        sourceRadius = halfWidth / Math.abs(Math.cos(angle));
      } else {
        // ตัดขอบบน/ล่าง
        sourceRadius = halfHeight / Math.abs(Math.sin(angle));
      }
    } else {
      // Default fallback
      sourceRadius = 50 * zoomLevel;
    }
    
    if (targetEl.type === ELEMENT_TYPES.CIRCLE) {
      targetRadius = (targetEl.width / 2) * zoomLevel;
    } else if (targetEl.type === ELEMENT_TYPES.TEXTBOX) {
      const halfWidth = (targetEl.width+100 / 2) * zoomLevel;
      const halfHeight = (targetEl.height / 2) * zoomLevel;
      
      // หาจุดที่เส้นตัดกับขอบกรอบ (มุมตรงข้าม)
      const reverseAngle = angle + Math.PI;
      const absReverseAngle = Math.abs(reverseAngle);
      const cornerAngle = Math.atan2(halfHeight, halfWidth);
      
      if (absReverseAngle <= cornerAngle || absReverseAngle >= Math.PI - cornerAngle) {
        targetRadius = halfWidth / Math.abs(Math.cos(reverseAngle));
      } else {
        targetRadius = halfHeight / Math.abs(Math.sin(reverseAngle));
      }
    } else {
      targetRadius = 50 * zoomLevel;
    }
    
    // คำนวณจุดที่ขอบของ element
    const sourceEdgeX = sourceCenterX + Math.cos(angle) * sourceRadius;
    const sourceEdgeY = sourceCenterY + Math.sin(angle) * sourceRadius;
    
    const targetEdgeX = targetCenterX - Math.cos(angle) * targetRadius;
    const targetEdgeY = targetCenterY - Math.sin(angle) * targetRadius;
    
    return {
      x1: sourceEdgeX,
      y1: sourceEdgeY,
      x2: targetEdgeX,
      y2: targetEdgeY
    };
  };

  const validRelationships = elements
    .filter(element =>
      element.type === ELEMENT_TYPES.RELATIONSHIP &&
      !element.hidden &&
      element.sourceId &&
      element.targetId &&
      getElementById(element.sourceId) &&
      getElementById(element.targetId) &&
      !getElementById(element.sourceId).hidden &&
      !getElementById(element.targetId).hidden
    )
    .map(relationship => {
      const sourceEl = getElementById(relationship.sourceId);
      const targetEl = getElementById(relationship.targetId);
      
      const position = calculateEdgePoints(sourceEl, targetEl);
      
      return { relationship, position, isValid: !!position };
    });

  const renderArrowMarker = () => (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#1677ff" />
      </marker>
      <marker
        id="family-arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fa541c" />
      </marker>
      {/* Dynamic markers for custom colors */}
      {validRelationships.map(({ relationship }) => (
        <marker
          key={`marker-${relationship.id}`}
          id={`arrowhead-${relationship.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={relationship.color || "#1677ff"} />
        </marker>
      ))}
    </defs>
  );

  const getStrokeDashArray = (lineType) => {
    switch (lineType) {
      case 'dashed':
        return `${8 * zoomLevel},${4 * zoomLevel}`;
      case 'dotted':
        return `${2 * zoomLevel},${2 * zoomLevel}`;
      case 'dashdot':
        return `${8 * zoomLevel},${4 * zoomLevel},${2 * zoomLevel},${4 * zoomLevel}`;
      default:
        return 'none';
    }
  };

  return (
    <svg 
      className="relationships-layer" 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {renderArrowMarker()}

      {validRelationships
        .filter(rel => rel.isValid)
        .map(({ relationship, position }) => {
          if (!position) return null;

          // ✅ ใช้ตำแหน่งที่คำนวณแล้ว (รวม zoomLevel แล้ว)
          const { x1, y1, x2, y2 } = position;
          
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const isSelected = selectedElements.includes(relationship.id);
          
          const isChild = relationship.relationshipType === 'child-of';
          const color = relationship.color || (isChild ? '#fa541c' : '#1677ff');
          const markerId = `arrowhead-${relationship.id}`;
          const lineType = relationship.lineType || 'solid';

          // คำนวณตำแหน่ง label
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const labelDistance = 25 * zoomLevel;
          const labelOffsetX = Math.sin(angle) * labelDistance;
          const labelOffsetY = -Math.cos(angle) * labelDistance;

          return (
            <g key={relationship.id}>
              {/* Main relationship line */}
              <line
                x1={x1}
                y1={y1+100}
                x2={x2}
                y2={y2+100}
                stroke={color}
                strokeWidth={isSelected ? 4 * zoomLevel : 2 * zoomLevel}
                strokeDasharray={getStrokeDashArray(lineType)}
                markerEnd={relationship.directed ? `url(#${markerId})` : ""}
                className={`relationship-line ${isSelected ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isReadOnly) {
                    handleSelectElement(relationship.id);
                  }
                }}
                style={{ 
                  cursor: isReadOnly ? 'default' : 'pointer',
                  filter: isSelected ? 'drop-shadow(0 0 3px rgba(22, 119, 255, 0.5))' : 'none',
                  pointerEvents: 'auto'
                }}
              />

              {/* Invisible thicker line for easier clicking */}
              {!isReadOnly && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={12 * zoomLevel}
                  style={{ 
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(relationship.id);
                  }}
                />
              )}

              {/* Relationship label */}
              <g transform={`translate(${midX + labelOffsetX}, ${midY + labelOffsetY})`}>
                {/* Label background */}
                <rect
                  x={-60 * zoomLevel}
                  y={70 * zoomLevel}
                  width={90 * zoomLevel}
                  height={28 * zoomLevel}
                  fill="rgba(255, 255, 255, 0.95)"
                  stroke={isSelected ? color : '#ddd'}
                  strokeWidth={isSelected ? 2 : 1}
                  rx={14 * zoomLevel}
                  ry={14 * zoomLevel}
                  className="relationship-label-bg"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isReadOnly) {
                      handleSelectElement(relationship.id);
                    }
                  }}
                  style={{ 
                    cursor: isReadOnly ? 'default' : 'pointer',
                    pointerEvents: 'auto',
                    filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                  }}
                />
                
                {/* Label text */}
                <foreignObject
                  x={-55 * zoomLevel}
                  y={70 * zoomLevel}
                  width={80 * zoomLevel}
                  height={20 * zoomLevel}
                  className="relationship-label-container"
                >
                  {isSelected && !isReadOnly ? (
                    <input
                      type="text"
                      value={relationship.text || ''}
                      placeholder="relationship"
                      className="relationship-label-input"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateElement(relationship.id, { text: e.target.value })}
                      onBlur={() => {
                        // Optional: deselect after editing
                        // handleSelectElement(null);
                      }}
                      autoFocus
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'center',
                        fontSize: `${13 * zoomLevel}px`,
                        outline: 'none',
                        color: '#333',
                        fontWeight: '500',
                        pointerEvents: 'auto'
                      }}
                    />
                  ) : (
                    <div
                      className="relationship-label-display"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) {
                          handleSelectElement(relationship.id);
                        }
                      }}
                      style={{
                        textAlign: 'center',
                        fontSize: `${13 * zoomLevel}px`,
                        color: '#333',
                        cursor: isReadOnly ? 'default' : 'pointer',
                        lineHeight: `${20 * zoomLevel}px`,
                        fontWeight: '500',
                        pointerEvents: 'auto',
                        padding: '2px 4px'
                      }}
                    >
                      {relationship.text || 'relationship'}
                    </div>
                  )}
                </foreignObject>
              </g>
            </g>
          );
        })}
    </svg>
  );
}

RelationshipLayer.propTypes = {
  elements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    hidden: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    sourceId: PropTypes.string,
    targetId: PropTypes.string,
    relationshipType: PropTypes.string,
    color: PropTypes.string,
    lineType: PropTypes.string,
    directed: PropTypes.bool,
    text: PropTypes.string,
  })).isRequired,
  selectedElements: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleSelectElement: PropTypes.func.isRequired,
  updateElement: PropTypes.func.isRequired,
  removeElement: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number,
  isReadOnly: PropTypes.bool,
};

export default RelationshipLayer;