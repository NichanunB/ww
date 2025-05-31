// frontend/src/hooks/useElementManager.js
import { useState, useRef } from 'react';
import { generateId } from '../utils/helpers';
import { ELEMENT_TYPES } from '../constants/elementTypes';
import '../components/styles/editpage.css';

export default function useElementManager(canvasRef) {
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const fileInputRef = useRef(null);

  const addElement = (type) => (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const canvasRect = canvasRef?.current?.getBoundingClientRect();
    const centerX = canvasRect ? (canvasRect.width / 2) : 300;
    const centerY = canvasRect ? (canvasRect.height / 2) : 200;

    const newElement = {
      id: generateId(),
      type,
      x: centerX,
      y: centerY,
      width: type === ELEMENT_TYPES.LINE ? 100 :
             type === ELEMENT_TYPES.TEXTBOX ? 150 :
             type === ELEMENT_TYPES.CIRCLE ? 80 : undefined,
      height: type === ELEMENT_TYPES.TEXTBOX ? 100 :
              type === ELEMENT_TYPES.CIRCLE ? 80 : undefined,
      rotation: 0,
      color: '#000000',
      fontColor: '#000000',
      fontSize: 16,
      text: type === ELEMENT_TYPES.TEXTBOX ? 'Enter text here' : '',
      characterType: type === ELEMENT_TYPES.CIRCLE ? 'neutral' : undefined,
      details: type === ELEMENT_TYPES.CIRCLE ? '' : undefined,
      age: type === ELEMENT_TYPES.CIRCLE ? '' : undefined,
      profileImage: null,
      hidden: false
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElements([newElement.id]);
    return newElement;
  };

  const updateElement = (id, updates) => {
    setElements(prev =>
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const removeElement = (id) => {
    setElements(prev =>
      prev.filter(el =>
        el.id !== id &&
        !(el.type === ELEMENT_TYPES.RELATIONSHIP &&
          (el.sourceId === id || el.targetId === id))
      )
    );
    setSelectedElements(prev => prev.filter(sid => sid !== id));
  };

  const createRelationship = (sourceId, targetId, relationshipType) => {
    const circleCount = elements.filter(el => el.type === ELEMENT_TYPES.CIRCLE).length;
    if (circleCount < 2) return;

    const exists = elements.some(el =>
      el.type === ELEMENT_TYPES.RELATIONSHIP &&
      ((el.sourceId === sourceId && el.targetId === targetId) ||
       (el.sourceId === targetId && el.targetId === sourceId))
    );
    if (exists) return;

    const newRel = {
      id: generateId(),
      type: ELEMENT_TYPES.RELATIONSHIP,
      sourceId,
      targetId,
      text: relationshipType === 'child-of' ? 'child of' : '',
      color: relationshipType === 'child-of' ? '#fa541c' : '#1677ff',
      relationshipType: relationshipType,
      directed: relationshipType === 'child-of',
      hidden: false
    };

    setElements(prev => [...prev, newRel]);
  };

  const toggleElementVisibility = (id) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      updateElement(id, { hidden: !el.hidden });
    }
  };

  const handleSelectElement = (id, options = {}) => {
    const { isErasing, relationshipMode } = options;

    if (id === null) {
      setSelectedElements([]);
      return;
    }

    if (isErasing) {
      removeElement(id);
      return;
    }

    const element = elements.find(el => el.id === id);
    if (!element) return;

    if (relationshipMode && element.type === ELEMENT_TYPES.CIRCLE) {
      const characterCount = elements.filter(el => el.type === ELEMENT_TYPES.CIRCLE).length;
      if (characterCount < 2) {
        alert("You need at least 2 characters to create a relationship.");
        return;
      }

      if (selectedElements.includes(id)) {
        setSelectedElements(prev => prev.filter(sid => sid !== id));
      } else {
        const newSelection = [...selectedElements, id].slice(-2);
        setSelectedElements(newSelection);
        if (newSelection.length === 2) {
          const [sourceId, targetId] = newSelection;
          const source = elements.find(el => el.id === sourceId);
          const target = elements.find(el => el.id === targetId);
          if (source?.type === ELEMENT_TYPES.CIRCLE && target?.type === ELEMENT_TYPES.CIRCLE) {
            createRelationship(sourceId, targetId);
            setSelectedElements([]);
          }
        }
      }
    } else {
      setSelectedElements([id]);
    }
  };

  const triggerImageUpload = (elementId) => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      fileInputRef.current = input;
    }

    fileInputRef.current.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        updateElement(elementId, { profileImage: event.target.result });
      };
      reader.readAsDataURL(file);
    };

    fileInputRef.current.click();
  };

  const clearSelection = () => {
    setSelectedElements([]);
  };

  const setCharacterType = (id, characterType) => {
    updateElement(id, { characterType });
  };

  const getSelectedElement = () => {
    return elements.find(el => selectedElements[0] === el.id);
  };

  // New function to set elements (used when loading project)
  const setElementsFromProject = (newElements) => {
    setElements(newElements);
    setSelectedElements([]);
  };

  return {
    elements,
    selectedElements,
    selectedElement: getSelectedElement(),
    setElements: setElementsFromProject, // Expose this for loading projects
    addElement,
    updateElement,
    removeElement,
    createRelationship,
    toggleElementVisibility,
    handleSelectElement,
    clearSelection,
    setCharacterType,
    triggerImageUpload,
  };
}