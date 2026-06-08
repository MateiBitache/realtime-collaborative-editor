import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="app">Real Time Collaborative Editor</main>;
}

createRoot(document.getElementById("root")).render(<App />);
