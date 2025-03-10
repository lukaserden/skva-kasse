import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Mitglieder from './pages/Mitglieder';
import Artikel from './pages/Artikel';
import Transaktionen from './pages/Transaktionen';
import Serviceeinheiten from './pages/Serviceeinheiten';
import Kasse from './pages/Kasse';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Dashboard />}>
          {/* Index-Route: Wird angezeigt, wenn /admin ohne weiteren Pfad aufgerufen wird */}
          <Route
            index
            element={
              <div>
                <h1>Dashboard</h1>
                <p>Startpunkt um auf versch. Dashboardpunkte zu navigieren.</p>
                
              </div>
            }
          />
          <Route path="mitglieder" element={<Mitglieder />} />
          <Route path="artikel" element={<Artikel />} />
          <Route path="transaktionen" element={<Transaktionen />} />
          <Route path="serviceeinheiten" element={<Serviceeinheiten />} />
        </Route>
        <Route path="/kasse" element={<Kasse />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;