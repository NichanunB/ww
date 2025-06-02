import { useState } from 'react';
import '../components/styles/editpage.css';

export default function useToolManager(canvasRef, relationshipType = 'generic') {
  const [activeTool, setActiveTool] = useState('cursor');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [relationshipMode, setRelationshipMode] = useState(false);

  // Derived state
  const isErasing = activeTool === 'eraser';

  // Tool management
  const setTool = (tool) => {
    setActiveTool(tool);
    if (tool !== 'edit') {
      setEditOpen(false);
    }
    if (tool !== 'style') {
      setStyleOpen(false);
    }
    if (tool !== 'relationship') {
      setRelationshipMode(false);
    }
  };

  const toggleEdit = () => {
    setEditOpen(!editOpen);
    setStyleOpen(false);
    setActiveTool('edit');
  };

  const toggleStyle = () => {
    setStyleOpen(!styleOpen);
    setEditOpen(false);
    setActiveTool('style');
  };

  const toggleEraser = () => {
    setTool(activeTool === 'eraser' ? 'cursor' : 'eraser');
  };

  const toggleRelationshipMode = () => {
    setRelationshipMode(!relationshipMode);
    setTool(relationshipMode ? 'cursor' : 'relationship');
    
  };

  // Canvas operations
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  return {
    activeTool,
    zoomLevel,
    editOpen,
    styleOpen,
    relationshipMode,
    isErasing,
    setTool,
    toggleEdit,
    toggleStyle,
    toggleEraser,
    toggleRelationshipMode,
    handleZoomIn,
    handleZoomOut,
  };
}

