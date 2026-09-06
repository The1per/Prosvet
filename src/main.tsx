import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { следитьЗаМасштабом } from "./scale";

// Раскладка рассчитана на широкий экран; на узком она показывается мельче,
// а не перестраивается. См. scale.ts.
следитьЗаМасштабом();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
