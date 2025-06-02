import React, { useEffect, useRef, useState } from 'react';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css';

const splitLongWordToFit = (ctx, word, maxWidth) => {
  const parts = [];
  let part = '';
  for (let i = 0; i < word.length; i++) {
    const test = part + word[i];
    if (ctx.measureText(test).width > maxWidth) {
      if (part.length === 0) break;
      parts.push(part);
      part = word[i];
    } else {
      part = test;
    }
  }
  if (part) parts.push(part);
  return parts;
};

// Helper function to render elements
const renderElement = (ctx, element, isSelected, zoomLevel) => {
  if (element.hidden) return;

  ctx.save();

  const zoomedX = element.x * zoomLevel;
  const zoomedY = element.y * zoomLevel;

  if (isSelected) {
    ctx.strokeStyle = '#1677ff';
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = element.color || '#000000';
    ctx.lineWidth = 1;
  }

  switch (element.type) {
    case ELEMENT_TYPES.CIRCLE: {
      const radius = (element.width / 2) * zoomLevel;

      ctx.beginPath();
      ctx.arc(zoomedX, zoomedY, radius, 0, Math.PI * 2);

      switch (element.characterType) {
        case 'protagonist':
          ctx.fillStyle = '#e6f7ff';
          break;
        case 'antagonist':
          ctx.fillStyle = '#fff1f0';
          break;
        case 'supporting':
          ctx.fillStyle = '#f6ffed';
          break;
        default:
          ctx.fillStyle = '#ffffff';
      }

      ctx.fill();
      ctx.stroke();

      if (element.profileImage) {
        const img = new Image();
        img.src = element.profileImage;

        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(zoomedX, zoomedY, radius * 0.9, 0, Math.PI * 2);
          ctx.clip();

          const size = radius * 1.8;
          ctx.drawImage(img, zoomedX - size / 2, zoomedY - size / 2, size, size);
          ctx.restore();
        };
      }

      if (element.text) {
        ctx.fillStyle = '#000000';
        ctx.font = `${12 * zoomLevel}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(element.text, zoomedX, zoomedY + radius + 20 * zoomLevel);
      }
      break;
    }

    case ELEMENT_TYPES.TEXTBOX: {
      const width = element.width * zoomLevel;
      const height = element.height * zoomLevel;
      const padding = 8 * zoomLevel;
      const fontSize = (element.fontSize || 14) * zoomLevel;
      const lineHeight = fontSize * 1.4;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(zoomedX - width / 2, zoomedY - height / 2, width, height);
      ctx.strokeRect(zoomedX - width / 2, zoomedY - height / 2, width, height);

      if (element.text) {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = element.fontColor || '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const words = element.text.split(/\s+/);
        const maxWidth = width - padding * 2;
        let y = zoomedY - height / 2 + padding;
        let line = '';

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = line + word + ' ';
          const testWidth = ctx.measureText(testLine.trim()).width;

          if (testWidth > maxWidth) {
            if (ctx.measureText(word).width > maxWidth) {
              const parts = splitLongWordToFit(ctx, word, maxWidth);
              ctx.fillText(line.trim(), zoomedX - width / 2 + padding, y);
              y += lineHeight;
              parts.forEach((part) => {
                if (y + lineHeight > zoomedY + height / 2 - padding) return;
                ctx.fillText(part.trim(), zoomedX - width / 2 + padding, y);
                y += lineHeight;
              });
              line = '';
            } else {
              ctx.fillText(line.trim(), zoomedX - width / 2 + padding, y);
              line = word + ' ';
              y += lineHeight;
            }
            if (y + lineHeight > zoomedY + height / 2 - padding) break;
          } else {
            line = testLine;
          }
        }
        if (y + lineHeight <= zoomedY + height / 2 - padding) {
          ctx.fillText(line.trim(), zoomedX - width / 2 + padding, y);
        }
      }
      break;
    }

    case ELEMENT_TYPES.LINE: {
      ctx.beginPath();
      ctx.moveTo(zoomedX, zoomedY);
      ctx.lineTo(zoomedX + (element.width * zoomLevel), zoomedY);
      ctx.stroke();
      break;
    }

    // ✅ ลบ case ELEMENT_TYPES.RELATIONSHIP ออกทั้งหมด
    // เพราะให้ RelationshipLayer.jsx จัดการแสดงผลแทน

    default:
      break;
  }

  ctx.restore();
};

const Canvas = ({ 
  canvasRef,
  elements, 
  selectedElements, 
  zoomLevel, 
  isErasing,
  relationshipMode,
  handleSelectElement, 
  updateElement,
  handleCanvasClick 
}) => {
  const canvasContext = useRef(null);
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedElementIds, setDraggedElementIds] = useState([]);
  
  // Initialize canvas on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvasContext.current = ctx;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // ✅ ไม่ต้องทำให้ elements เป็น global แล้ว
    // เพราะ RelationshipLayer จัดการ relationship เอง
    
    // Initial render
    renderCanvas();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      renderCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef]);
  
  // Re-render when elements or selection changes
  useEffect(() => {
    renderCanvas();
  }, [elements, selectedElements, zoomLevel]);
  
  // Function to render all elements on the canvas
  const renderCanvas = () => {
    if (!canvasRef.current || !canvasContext.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvasContext.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    drawGrid(ctx, canvas.width, canvas.height, zoomLevel);
    
    // ✅ แสดงผลเฉพาะ element ที่ไม่ใช่ RELATIONSHIP
    // เพราะ RELATIONSHIP ให้ RelationshipLayer จัดการ
    elements
      .filter(element => element.type !== ELEMENT_TYPES.RELATIONSHIP)
      .forEach(element => {
        renderElement(
          ctx, 
          element, 
          selectedElements.includes(element.id),
          zoomLevel
        );
      });
  };
  
  // Draw a grid on the canvas
  const drawGrid = (ctx, width, height, zoom) => {
    const gridSize = 20 * zoom;
    
    ctx.save();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  // Function to check if a point is within an element
  const isPointInElement = (x, y, element) => {
    if (element.hidden) return false;
    
    switch (element.type) {
      case ELEMENT_TYPES.CIRCLE:
        const radius = element.width / 2;
        const distance = Math.sqrt(
          Math.pow(element.x - x, 2) + Math.pow(element.y - y, 2)
        );
        return distance <= radius;
        
      case ELEMENT_TYPES.TEXTBOX:
        return (
          x >= element.x - element.width/2 &&
          x <= element.x + element.width/2 &&
          y >= element.y - element.height/2 &&
          y <= element.y + element.height/2
        );
        
      case ELEMENT_TYPES.LINE:
        const lineEndX = element.x + element.width;
        // For simplicity, we'll consider a small area around the line
        return (
          x >= element.x - 5 &&
          x <= lineEndX + 5 &&
          y >= element.y - 5 &&
          y <= element.y + 5
        );
        
      // ✅ ลบ case ELEMENT_TYPES.RELATIONSHIP ออก
      // เพราะ RelationshipLayer จัดการการคลิกเอง
        
      default:
        return false;
    }
  };
  
  // Handle mouse down for starting drag
  const handleMouseDown = (e) => {
    if (isErasing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    // ✅ หา element ที่คลิก โดยไม่รวม RELATIONSHIP
    const clickedElement = [...elements]
      .filter(element => element.type !== ELEMENT_TYPES.RELATIONSHIP)
      .reverse()
      .find(element => isPointInElement(x, y, element));
    
    if (clickedElement) {
      // Start dragging the clicked element
      setIsDragging(true);
      setDragStart({ x, y });
      
      // If the clicked element is not already selected, select only this element
      if (!selectedElements.includes(clickedElement.id)) {
        handleSelectElement(clickedElement.id, { isErasing, relationshipMode });
        setDraggedElementIds([clickedElement.id]);
      } else {
        // If already selected, keep current selection and drag all selected elements
        setDraggedElementIds([...selectedElements]);
      }
      
      // Close any open dropdowns
      if (handleCanvasClick) {
        handleCanvasClick();
      }
    } else {
      // Clear selection if clicking empty space
      handleSelectElement(null);
      setDraggedElementIds([]);
      
      // Close any open dropdowns
      if (handleCanvasClick) {
        handleCanvasClick();
      }
    }
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || draggedElementIds.length === 0 || isErasing || relationshipMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    // Calculate distance moved
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    // Update drag start for the next move
    setDragStart({ x, y });

    // Update position for all dragged elements
    draggedElementIds.forEach((id) => {
      const element = elements.find((el) => el.id === id);
      if (element) {
        updateElement(id, {
          x: element.x + dx,
          y: element.y + dy,
        });
      }
    });
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedElementIds([]);
    }
  };
  
  // Handle mouse out to end dragging if cursor leaves canvas
  const handleMouseOut = () => {
    setIsDragging(false);
  };
  
  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="diagram-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      />
    </div>
  );
};

export default Canvas;