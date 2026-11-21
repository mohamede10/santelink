"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Pill,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  Search,
  ClipboardList,
  Package,
  MessageCircle,
  Activity,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Validation comptes", href: "/admin/validations", icon: UserCheck },
    { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { label: "Médicaments", href: "/admin/medicaments", icon: Pill },
    { label: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
    { label: "Audit", href: "/admin/audit", icon: ClipboardList },
    { label: "Paramètres", href: "/admin/parametres", icon: Settings },
  ],
  MEDECIN: [
    { label: "Tableau de bord", href: "/medecin", icon: LayoutDashboard },
    { label: "Mes patients", href: "/medecin/patients", icon: Users },
    { label: "Consultations", href: "/medecin/consultations", icon: FileText },
    { label: "Ordonnances", href: "/medecin/ordonnances", icon: QrCode },
    { label: "Rendez-vous", href: "/medecin/rendez-vous", icon: Calendar },
    { label: "Statistiques", href: "/medecin/statistiques", icon: Activity },
  ],
  PHARMACIEN: [
    { label: "Tableau de bord", href: "/pharmacien", icon: LayoutDashboard },
    { label: "Scanner QR", href: "/pharmacien/scanner", icon: QrCode },
    { label: "Mon stock", href: "/pharmacien/stock", icon: Package },
    { label: "Délivrances", href: "/pharmacien/delivrances", icon: Pill },
    { label: "Médicaments", href: "/pharmacien/medicaments", icon: Search },
    { label: "Statistiques", href: "/pharmacien/statistiques", icon: BarChart3 },
  ],
  PATIENT: [
    { label: "Tableau de bord", href: "/patient", icon: LayoutDashboard },
    { label: "Mon dossier", href: "/patient/dossier", icon: FileText },
    { label: "Mes ordonnances", href: "/patient/ordonnances", icon: QrCode },
    { label: "Rendez-vous", href: "/patient/rendez-vous", icon: Calendar },
    { label: "Chercher médicament", href: "/patient/recherche", icon: Search },
    { label: "Messagerie", href: "/patient/messagerie", icon: MessageCircle },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  MEDECIN: "Médecin",
  PHARMACIEN: "Pharmacien",
  PATIENT: "Patient",
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MEDECIN: "bg-blue-100 text-blue-700",
  PHARMACIEN: "bg-amber-100 text-amber-700",
  PATIENT: "bg-emerald-100 text-emerald-700",
};

interface DashboardShellProps {
  children: React.ReactNode;
  role: Role;
  userName: string;
  subtitle?: string;
}

export function DashboardShell({ children, role, userName, subtitle }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_ITEMS[role] || [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Sidebar Desktop ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
          <Stethoscope className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-bold text-gray-900">
            Santé<span className="text-emerald-600">Link</span>
          </span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1", ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
          </span>
          {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold">Santé<span className="text-emerald-600">Link</span></span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-200">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-700">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
