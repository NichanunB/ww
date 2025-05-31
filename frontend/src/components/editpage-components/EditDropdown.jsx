import React from 'react';
import { ELEMENT_TYPES } from '../../constants/elementTypes';
import '../styles/editpage.css';

// Fix: Change onClick event handlers to use proper function calls
function EditDropdown({ isOpen, addElement }) {
  return (
    <div className={`edit-dropdown ${isOpen ? "open" : ""}`}>
      <ul>
        <li>
          <a href="#" onClick={(e) => { 
            e.preventDefault();
            addElement(ELEMENT_TYPES.CIRCLE)();
          }}>
            เพิ่มตัวละคร (Add Character)
          </a>
        </li>
        {/* <li>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            addElement(ELEMENT_TYPES.IMAGE)();
          }}>
            เพิ่มรูปภาพ (Add Image)
          </a>
        </li> */}
        <li>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            addElement(ELEMENT_TYPES.TEXTBOX)();
          }}>
            กล่องข้อความ (Add Text Box)
          </a>
        </li>
      </ul>
    </div>
  );
}

export default EditDropdown;