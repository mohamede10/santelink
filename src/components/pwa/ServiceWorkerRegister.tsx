"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker actif :", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Échec enregistrement Service Worker :", error);
          });
      });
    }
  }, []);

  return null;
}
