import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink
              to="/admin"
              end // sorgt dafür, dass nur der exakte Pfad aktiv ist
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/mitglieder"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Mitglieder
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/artikel"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Artikel
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/transaktionen"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Transaktionen
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/serviceeinheiten"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Serviceeinheiten
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;