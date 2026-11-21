import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Server, Database, Lock } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-7 w-7 text-emerald-600" />
          Paramètres & Configuration Système
        </h1>
        <p className="text-gray-500 mt-1">
          Configuration des protocoles de sécurité, chiffrement et référentiels
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Sécurité & Chiffrement (RG-08)</CardTitle>
            </div>
            <CardDescription>Paramètres cryptographiques des ordonnances et sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Signature QR Code</p>
                <p className="text-xs text-gray-500">Algorithme HMAC SHA-256 avec clé secrète dédiée</p>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Durée des Sessions JWT</p>
                <p className="text-xs text-gray-500">Cookies HttpOnly sécurisés avec expiration 7 jours</p>
              </div>
              <Badge variant="outline">7 jours</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Contrôle d&apos;accès basé sur les rôles (RBAC)</p>
                <p className="text-xs text-gray-500">Isolation stricte des 4 profils via middleware Next.js</p>
              </div>
              <Badge variant="success">Strict</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Infrastructure de Données</CardTitle>
            </div>
            <CardDescription>Base de données PostgreSQL et pooler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Moteur de Base de Données</p>
                <p className="text-xs text-gray-500">PostgreSQL (Supabase Cloud + PgBouncer)</p>
              </div>
              <Badge variant="info">Connecté</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Mode Hors-Ligne & PWA</p>
                <p className="text-xs text-gray-500">IndexedDB local + Service Worker</p>
              </div>
              <Badge variant="success">Opérationnel</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
