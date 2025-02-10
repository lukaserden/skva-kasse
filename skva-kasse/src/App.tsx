import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Kasse from './pages/Kasse';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route für das Admin-Dashboard */}
        <Route path="/admin" element={<Dashboard />} />
        {/* Route für die Kassen-Oberfläche */}
        <Route path="/kasse" element={<Kasse />} />
        {/* Fallback-Route: Leitet alle unbekannten Pfade zur Kasse */}
        <Route path="*" element={<Kasse />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;