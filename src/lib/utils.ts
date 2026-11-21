import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un numéro de dossier patient unique
 * Format: PAT-YYYY-XXXXX
 */
export function generateNumDossier(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PAT-${year}-${random}`;
}

/**
 * Formate une date en format français
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-GN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-GN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Lien WhatsApp avec message pré-rempli
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
