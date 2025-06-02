import React from 'react';
import '../styles/editpage.css';
import { ELEMENT_TYPES } from '../../constants/elementTypes'; // ✅ อย่าลืม import

function RelationDropdown({ isOpen, selectedElement, relationshipType, setRelationshipType }) {
  const shouldShow = isOpen && selectedElement?.type === ELEMENT_TYPES.CIRCLE;

  return (
    <div className={`style-dropdown ${shouldShow ? "open" : ""}`}>
      <ul>
        <li
          className={relationshipType === "generic" ? "active" : ""}
          onClick={() => setRelationshipType("generic")}
        >
          Generic
        </li>
        <li
          className={relationshipType === "child-of" ? "active" : ""}
          onClick={() => setRelationshipType("child-of")}
        >
          Child of
        </li>
      </ul>
    </div>
  );
}

export default RelationDropdown;
