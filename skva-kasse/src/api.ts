// src/api.ts
import axios from "axios";

// 🔧 Eigene Axios-Instanz
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor: Token automatisch anhängen
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🚨 Response Interceptor: zentrale Fehlerbehandlung
api.interceptors.response.use(
  (response) => response, // erfolgreiche Antwort normal weitergeben
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn("⚠️ Nicht eingeloggt oder Token ungültig");
        alert("Du bist nicht eingeloggt. Bitte melde dich erneut an.");
        // Optional: automatischer Redirect
        // window.location.href = "/login";
      }

      if (status === 403) {
        alert("Du hast keine Berechtigung für diese Aktion.");
      }

      if (status === 500) {
        alert("Serverfehler – bitte später erneut versuchen.");
      }
    } else if (error.request) {
      alert("Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.");
    } else {
      alert("Unbekannter Fehler: " + error.message);
    }

    return Promise.reject(error); // damit .catch(...) funktioniert
  }
);

export default api;