import React, { useEffect, useRef, useState } from 'react';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css';

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
      const fontSize = (element.fontSize || 14) * zoomLevel;
      const lineHeight = fontSize * 1.4;
      const padding = 8 * zoomLevel;

      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = element.fontColor || '#000000';

      const words = element.text.split(/\s+/);
      let lines = [];
      let line = '';
      let maxWidth = 0;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = ctx.measureText(testLine.trim()).width;
        if (testWidth > 200) {
          lines.push(line.trim());
          maxWidth = Math.max(maxWidth, ctx.measureText(line.trim()).width);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        lines.push(line.trim());
        maxWidth = Math.max(maxWidth, ctx.measureText(line.trim()).width);
      }

      const boxWidth = maxWidth + padding * 2;
      const boxHeight = lines.length * lineHeight + padding * 2;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(zoomedX - boxWidth / 2, zoomedY - boxHeight / 2, boxWidth, boxHeight);
      ctx.strokeRect(zoomedX - boxWidth / 2, zoomedY - boxHeight / 2, boxWidth, boxHeight);

      ctx.fillStyle = element.fontColor || '#000000';
      lines.forEach((ln, idx) => {
        const y = zoomedY - boxHeight / 2 + padding + idx * lineHeight;
        ctx.fillText(ln, zoomedX - boxWidth / 2 + padding, y);
      });

      break;
    }

    case ELEMENT_TYPES.LINE: {
      ctx.beginPath();
      ctx.moveTo(zoomedX, zoomedY);
      ctx.lineTo(zoomedX + (element.width * zoomLevel), zoomedY);
      ctx.stroke();
      break;
    }

    case ELEMENT_TYPES.RELATIONSHIP: {
      const sourceEl = window.elements?.find(el => el.id === element.sourceId);
      const targetEl = window.elements?.find(el => el.id === element.targetId);

      if (sourceEl && targetEl) {
        const sourceX = sourceEl.x * zoomLevel;
        const sourceY = sourceEl.y * zoomLevel;
        const targetX = targetEl.x * zoomLevel;
        const targetY = targetEl.y * zoomLevel;

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = element.color || '#1677ff';
        ctx.stroke();

        if (element.text) {
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;

          ctx.font = `${12 * zoomLevel}px Arial`;
          const textMetrics = ctx.measureText(element.text);
          const padding = 5 * zoomLevel;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(midX - textMetrics.width / 2 - padding, midY - 10 * zoomLevel, textMetrics.width + padding * 2, 20 * zoomLevel);

          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.text, midX, midY);
        }
      }
      break;
    }

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

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedElementIds, setDraggedElementIds] = useState([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvasContext.current = ctx;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    window.elements = elements;

    renderCanvas();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  useEffect(() => {
    window.elements = elements;
    renderCanvas();
  }, [elements, selectedElements, zoomLevel]);

  const renderCanvas = () => {
    if (!canvasRef.current || !canvasContext.current) return;
    const canvas = canvasRef.current;
    const ctx = canvasContext.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, zoomLevel);

    elements.forEach(element => {
      renderElement(ctx, element, selectedElements.includes(element.id), zoomLevel);
    });
  };

  const drawGrid = (ctx, width, height, zoom) => {
    const gridSize = 20 * zoom;
    ctx.save();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const isPointInElement = (x, y, element) => {
    if (element.hidden) return false;
    switch (element.type) {
      case ELEMENT_TYPES.CIRCLE:
        const radius = element.width / 2;
        return Math.sqrt((element.x - x) ** 2 + (element.y - y) ** 2) <= radius;
      case ELEMENT_TYPES.TEXTBOX:
        return (
          x >= element.x - element.width / 2 &&
          x <= element.x + element.width / 2 &&
          y >= element.y - element.height / 2 &&
          y <= element.y + element.height / 2
        );
      case ELEMENT_TYPES.LINE:
        return (
          x >= element.x - 5 &&
          x <= element.x + element.width + 5 &&
          y >= element.y - 5 &&
          y <= element.y + 5
        );
      default:
        return false;
    }
  };

  const handleMouseDown = (e) => {
    if (isErasing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    const clickedElement = [...elements].reverse().find(el => isPointInElement(x, y, el));

    if (clickedElement) {
      setIsDragging(true);
      setDragStart({ x, y });
      if (!selectedElements.includes(clickedElement.id)) {
        handleSelectElement(clickedElement.id, { isErasing, relationshipMode });
        setDraggedElementIds([clickedElement.id]);
      } else {
        setDraggedElementIds([...selectedElements]);
      }
      if (handleCanvasClick) handleCanvasClick();
    } else {
      handleSelectElement(null);
      setDraggedElementIds([]);
      if (handleCanvasClick) handleCanvasClick();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || draggedElementIds.length === 0 || isErasing || relationshipMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    setDragStart({ x, y });

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

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedElementIds([]);
    }
  };

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
