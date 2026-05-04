import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

/**
 * Vite emette `vite:preloadError` quando un dynamic import (chunk lazy)
 * fallisce. Tipico in produzione: l'utente ha tab aperto da ore, viene
 * fatto un deploy, i chunk vecchi non esistono più sul CDN. Soluzione
 * universale: ricaricare la pagina (carica HTML + nuovo bundle).
 *
 * Senza questo handler resta solo un'unhandled promise rejection in
 * console e l'app rimane congelata sulla pagina che ha provato a caricare.
 */
window.addEventListener("vite:preloadError", () => {
  console.warn("[vite] chunk preload failed — reloading");
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
