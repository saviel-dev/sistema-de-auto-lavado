import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { waveform } from 'ldrs';

waveform.register();

createRoot(document.getElementById("root")!).render(<App />);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado exitosamente:', registration.scope);
      })
      .catch((error) => {
        console.log('Error al registrar Service Worker:', error);
      });
  });
}
