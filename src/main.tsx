import { createRoot } from "react-dom/client";
import { checkAndInvalidateCache } from "./lib/version-check";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

const bootstrap = async () => {
  const shouldRender = await checkAndInvalidateCache();

  if (!shouldRender || !rootElement) return;

  createRoot(rootElement).render(<App />);
};

void bootstrap();
