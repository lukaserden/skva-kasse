import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">


      <Sidebar />
      {/* Hauptbereich */}
      <div className="main-content">
        <Header />
        <main>
          {/* Hier werden die verschachtelten Routen gerendert */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;