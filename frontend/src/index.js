import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import your CSS if needed
import App from "./App"; // Import the main App component
import { msalInstance } from "./auth-config";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App instance={msalInstance} />
  </React.StrictMode>
);
