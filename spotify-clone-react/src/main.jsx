
import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.jsx";

const homepage = document.getElementById("home-content");

if (homepage) {
  createRoot(homepage).render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>
  );
}
