// src/api.ts
import axios from "axios";

// 🔧 Eigene Axios-Instanz
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ⬅️ wichtig für Cookies bei allen Anfragen
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token abgelaufen
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // damit der refreshToken-Cookie mitgeschickt wird
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);

          // neuen Token anhängen & ursprüngliche Anfrage wiederholen
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Kein neuer Token erhalten");
        }
      } catch (refreshError) {
        console.warn("⚠️ Refresh fehlgeschlagen:", refreshError);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Andere Fehler behandeln
    if (error.response) {
      const status = error.response.status;

      if (status === 403) {
        alert("Du hast keine Berechtigung für diese Aktion.");
      }

      if (status === 500) {
        alert("Serverfehler – bitte später erneut versuchen.");
      }
    } else if (error.request) {
      alert(
        "Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung."
      );
    } else {
      alert("Unbekannter Fehler: " + error.message);
    }

    return Promise.reject(error);
  }
);

export async function loginUser(username: string, password: string) {
  const { accessToken } = (
    await api.post("/auth/login", { username, password })
  ).data;
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }
  return accessToken;
}

export default api;
