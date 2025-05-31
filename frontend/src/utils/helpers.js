// Generate a unique ID for elements
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Get character type styles based on type
export const getCharacterTypeStyles = (characterType) => {
  switch(characterType) {
    case 'hero':
      return { borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'villain':
      return { borderColor: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'supporter':
      return { borderColor: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' };
    default: // NEUTRAL
      return { borderColor: '#9E9E9E', backgroundColor: 'rgba(158, 158, 158, 0.1)' };
  }
};

// Calculate relationship line positions
export const calculateRelationshipPosition = (relationship, elements) => {
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