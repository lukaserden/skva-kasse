import React from 'react';
import { NavLink } from 'react-router-dom';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import GroupsTwoToneIcon from '@mui/icons-material/GroupsTwoTone';
import LocalOfferTwoToneIcon from '@mui/icons-material/LocalOfferTwoTone';
import PointOfSaleTwoToneIcon from '@mui/icons-material/PointOfSaleTwoTone';
import DateRangeIcon from '@mui/icons-material/DateRange';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <div className="sidebar-item"> 
                <HomeTwoToneIcon className="sidebar-icon" />
                <span className="sidebar-text">Home</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/mitglieder"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <div className="sidebar-item">
                <GroupsTwoToneIcon className="sidebar-icon" />
                <span className="sidebar-text">Mitglieder</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/artikel"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <div className="sidebar-item">
                <LocalOfferTwoToneIcon className="sidebar-icon" />
                <span className="sidebar-text">Artikel</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/transaktionen"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <div className="sidebar-item">
                <PointOfSaleTwoToneIcon className="sidebar-icon" />
                <span className="sidebar-text">Transaktionen</span>
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/serviceeinheiten"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <div className="sidebar-item">
                <DateRangeIcon className="sidebar-icon" />
                <span className="sidebar-text">Serviceeinheiten</span>
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;