import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { RuntimeProvider } from "./context/RuntimeContext";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <RuntimeProvider>
          <AuthProvider>
            <ProjectsProvider>
              <App />
            </ProjectsProvider>
          </AuthProvider>
        </RuntimeProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
