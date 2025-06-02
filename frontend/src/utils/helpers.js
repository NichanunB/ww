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

// ✅ ฟังก์ชันใหม่: คำนวณจุดตัดของเส้นตรงกับวงกลม
const getCircleIntersection = (centerX, centerY, radius, lineStartX, lineStartY, lineEndX, lineEndY) => {
  // คำนวณทิศทางของเส้น
  const dx = lineEndX - lineStartX;
  const dy = lineEndY - lineStartY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return { x: centerX, y: centerY };
  
  // หา unit vector
  const unitX = dx / length;
  const unitY = dy / length;
  
  // คำนวณจุดบนขอบวงกลม
  return {
    x: centerX + unitX * radius,
    y: centerY + unitY * radius
  };
};

// ✅ ปรับปรุงฟังก์ชันคำนวณตำแหน่งเส้นความสัมพันธ์
export const calculateRelationshipPosition = (relationship, elements) => {
  const source = elements.find(el => el.id === relationship.sourceId);
  const target = elements.find(el => el.id === relationship.targetId);
  
  if (!source || !target) return null;
  
  // หาจุดศูนย์กลางของวงกลม
  const sourceCenterX = source.x + (source.width || 100) / 2;
  const sourceCenterY = source.y + (source.height || 100) / 2;
  const targetCenterX = target.x + (target.width || 100) / 2;
  const targetCenterY = target.y + (target.height || 100) / 2;
  
  // หารัศมีของวงกลม
  const sourceRadius = (source.width || 100) / 2;
  const targetRadius = (target.width || 100) / 2;
  
  // คำนวณจุดเริ่มต้นบนขอบวงกลมต้นทาง (ชี้ไปหาปลายทาง)
  const sourceEdge = getCircleIntersection(
    sourceCenterX, sourceCenterY, sourceRadius,
    sourceCenterX, sourceCenterY, targetCenterX, targetCenterY
  );
  
  // คำนวณจุดปลายบนขอบวงกลมปลายทาง (ชี้มาจากต้นทาง)
  const targetEdge = getCircleIntersection(
    targetCenterX, targetCenterY, targetRadius,
    targetCenterX, targetCenterY, sourceCenterX, sourceCenterY
  );
  
  return {
    x1: sourceEdge.x,
    y1: sourceEdge.y,
    x2: targetEdge.x,
    y2: targetEdge.y
  };
};