import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  </React.StrictMode>
);
