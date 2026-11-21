"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Vérifier localStorage uniquement côté client
    const dismissed = localStorage.getItem("pwa-prompt-dismissed") === "true";
    setHasDismissed(dismissed);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Écouter l'installation réussie
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setShowPrompt(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
    setHasDismissed(true);
  };

  // Ne pas afficher pendant l'hydratation ou si conditions non remplies
  if (!isMounted || isInstalled || !showPrompt || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img
              src="/icons/icon-72x72.png"
              alt="SantéLink Logo"
              className="w-12 h-12 rounded-lg bg-emerald-50 p-1"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Installez l&apos;application SantéLink
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Accès rapide, sécurisé et disponible même hors ligne
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-700 bg-gray-100 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
