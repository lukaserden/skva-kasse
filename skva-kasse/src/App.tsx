import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Mitglieder from "./pages/Mitglieder";
import Artikel from "./pages/Artikel";
import Transaktionen from "./pages/Transaktionen";
import Serviceeinheiten from "./pages/Serviceeinheiten";
import Kasse from "./pages/Kasse";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Toaster } from "./components/ui/sonner";

const App: React.FC = () => {
  return (
    <>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Login ist öffentlich */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin-Dashboard nur mit Login sichtbar */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <div>
                    <h1>Dashboard</h1>
                  </div>
                }
              />
              <Route path="mitglieder" element={<Mitglieder />} />
              <Route path="artikel" element={<Artikel />} />
              <Route path="transaktionen" element={<Transaktionen />} />
              <Route path="serviceeinheiten" element={<Serviceeinheiten />} />
            </Route>

            {/* Auch die Kasse ist geschützt */}
            <Route
              path="/kasse"
              element={
                <ProtectedRoute>
                  <Kasse />
                </ProtectedRoute>
              }
            />

            {/* Wenn Route nicht gefunden → login */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </>
  );
};

export default App;
