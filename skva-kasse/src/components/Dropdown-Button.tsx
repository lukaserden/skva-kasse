import React, { useState } from "react";
import "../styles/Dropdown.css";

const DropdownButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-button" onClick={toggleDropdown}>
        Menü ▼
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li><a href="#">Bestellungen</a></li>
          <li><a href="#">Einstellungen</a></li>
          <li><a href="#">Logout</a></li>
        </ul>
      )}
    </div>
  );
};

export default DropdownButton;