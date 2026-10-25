import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.jsx";

// Find the homepage container in the existing HTML.
const homepage = document.getElementById("home-content");

// Render React only inside the homepage. Other pages remain regular HTML.
if (homepage) {
  createRoot(homepage).render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>
  );
}
