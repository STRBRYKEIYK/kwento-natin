import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/playfair-display/latin-400-italic.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-900.css";
import "@fontsource/playfair-display/latin-900-italic.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-700.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
