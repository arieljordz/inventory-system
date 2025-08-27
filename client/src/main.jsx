import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { SpinnerProvider } from "./context/SpinnerContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Render your app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SpinnerProvider>
          <App />
        </SpinnerProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);

