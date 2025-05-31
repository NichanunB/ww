// frontend/src/components/editpage-components/RelationshipLayer.jsx
import PropTypes from 'prop-types';
import { calculateRelationshipPosition } from '../../utils/helpers';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css';

function RelationshipLayer({
  elements,
  selectedElements,
  handleSelectElement,
  updateElement,
  removeElement
}) {
  const getElementById = (id) => elements.find(el => el.id === id);

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
      const position = calculateRelationshipPosition(relationship, elements);
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
        return '8,4';
      case 'dotted':
        return '2,2';
      case 'dashdot':
        return '8,4,2,4';
      default:
        return 'none';
    }
  };

  return (
    <svg className="relationships-layer">
      {renderArrowMarker()}

      {validRelationships
        .filter(rel => rel.isValid)
        .map(({ relationship, position }) => {
          if (!position) return null;

          const { x1, y1, x2, y2 } = position;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const isSelected = selectedElements.includes(relationship.id);
          
          const isChild = relationship.relationshipType === 'child-of';
          const color = relationship.color || (isChild ? '#fa541c' : '#1677ff');
          const markerId = `arrowhead-${relationship.id}`;
          const lineType = relationship.lineType || 'solid';

          // Calculate label position with better positioning
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const labelOffsetX = Math.sin(angle) * 20;
          const labelOffsetY = -Math.cos(angle) * 20;

          return (
            <g key={relationship.id}>
              {/* Main relationship line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={isSelected ? 4 : 2}
                strokeDasharray={getStrokeDashArray(lineType)}
                markerEnd={relationship.directed ? `url(#${markerId})` : ""}
                className={`relationship-line ${isSelected ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectElement(relationship.id);
                }}
                style={{ 
                  cursor: 'pointer',
                  filter: isSelected ? 'drop-shadow(0 0 3px rgba(22, 119, 255, 0.5))' : 'none'
                }}
              />

              {/* Invisible thicker line for easier clicking */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth="12"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectElement(relationship.id);
                }}
              />

              {/* Relationship label */}
              <g transform={`translate(${midX + labelOffsetX}, ${midY + labelOffsetY})`}>
                {/* Label background */}
                <rect
                  x="-40"
                  y="-12"
                  width="80"
                  height="24"
                  fill="white"
                  stroke={isSelected ? color : '#ddd'}
                  strokeWidth={isSelected ? 2 : 1}
                  rx="12"
                  ry="12"
                  className="relationship-label-bg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(relationship.id);
                  }}
                />
                
                {/* Label text */}
                <foreignObject
                  x="-35"
                  y="-8"
                  width="70"
                  height="16"
                  className="relationship-label-container"
                >
                  {isSelected ? (
                    <input
                      type="text"
                      value={relationship.text || ''}
                      placeholder="ป้ายกำกับ"
                      className="relationship-label-input"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateElement(relationship.id, { text: e.target.value })}
                      autoFocus
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'center',
                        fontSize: '12px',
                        outline: 'none',
                        color: '#333'
                      }}
                    />
                  ) : (
                    <div
                      className="relationship-label-display"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectElement(relationship.id);
                      }}
                      style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#333',
                        cursor: 'pointer',
                        lineHeight: '16px'
                      }}
                    >
                      {relationship.text || 'ป้ายกำกับ'}
                    </div>
                  )}
                </foreignObject>
              </g>

              {/* Delete button when selected */}
              {isSelected && (
                <g transform={`translate(${midX + labelOffsetX + 45}, ${midY + labelOffsetY - 12})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#ff4d4f"
                    stroke="white"
                    strokeWidth="2"
                    className="relationship-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(relationship.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    ×
                  </text>
                </g>
              )}
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
};

export default RelationshipLayer;
