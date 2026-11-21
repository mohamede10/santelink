import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineManager } from "@/components/pwa/OfflineManager";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "SantéLink — Coordination des soins en Guinée",
  description:
    "Plateforme d'interopérabilité et de coordination des soins. Dossier patient unifié, ordonnances sécurisées par QR code, gestion des stocks pharmaceutiques.",
  keywords: ["santé", "Guinée", "e-santé", "dossier patient", "ordonnance", "QR code", "pharmacie"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SantéLink",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}

        {/* ── Progressive Web App (PWA) & Offline Suite ── */}
        <ServiceWorkerRegister />
        <OfflineManager />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </body>
    </html>
  );
}
