/* eslint-disable no-unused-vars */
// utils/layoutTree.js
export function layoutFamilyTree(elements) {
  const positioned = new Map();
  const childMap = new Map();

  // Build tree structure
  elements.forEach(el => {
    if (el.type === 'relationship' && el.relationshipType === 'child-of') {
      const children = childMap.get(el.sourceId) || [];
      children.push(el.targetId);
      childMap.set(el.sourceId, children);
    }
  });

  const setPosition = (id, depth = 0, index = 0) => {
    if (positioned.has(id)) return;
    const element = elements.find(e => e.id === id);
    if (!element) return;

    const width = 100;
    const height = 100;
    const gapX = 180;
    const gapY = 200;

    // Set position based on depth
    element.x = index * gapX;
    element.y = depth * gapY;
    positioned.set(id, true);

    const children = childMap.get(id) || [];
    children.forEach((childId, childIndex) => {
      setPosition(childId, depth + 1, childIndex);
    });
  };

  // Find root elements (no one is their parent)
  const childIds = new Set();
  elements.forEach(el => {
    if (el.type === 'relationship' && el.relationshipType === 'child-of') {
      childIds.add(el.targetId);
    }
  });

  const rootNodes = elements.filter(el =>
    el.type !== 'relationship' &&
    !childIds.has(el.id)
  );

  rootNodes.forEach((rootEl, rootIndex) => {
    setPosition(rootEl.id, 0, rootIndex);
  });

  return elements;
}