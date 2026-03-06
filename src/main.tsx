import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorageApplication } from "./utils/supabase/storageInitialization";

// Initialize storage buckets on app startup
initializeStorageApplication().catch((error) => {
  console.error('Storage initialization failed:', error);
  // App will continue to work, just with potential issues for image uploads
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
