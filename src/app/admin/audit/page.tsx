import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Shield, Search } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nom: true, prenom: true, email: true, role: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-emerald-600" />
          Journal d&apos;Audit & Traçabilité (RG-08)
        </h1>
        <p className="text-gray-500 mt-1">
          Historique infalsifiable des accès et modifications sensibles de la plateforme
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal des évènements ({logs.length} derniers)</CardTitle>
          <CardDescription>
            Toutes les connexions, émissions d&apos;ordonnances, scans QR et délivrances sont consignés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="py-3">Date & Heure</th>
                  <th className="py-3">Acteur</th>
                  <th className="py-3">Rôle</th>
                  <th className="py-3">Action exécutée</th>
                  <th className="py-3">Entité ciblée</th>
                  <th className="py-3">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-600">
                      {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3 font-medium text-gray-900">
                      {log.user.prenom} {log.user.nom}
                      <span className="block text-xs text-gray-400 font-normal">{log.user.email}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline">{log.user.role}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          log.action.includes("LOGIN") ? "info" :
                          log.action.includes("CREATE") ? "success" :
                          log.action.includes("DELIVRANCE") ? "success" :
                          log.action.includes("INVALID") ? "danger" : "default"
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-gray-600">
                      {log.entite ? `${log.entite} (${log.entiteId?.slice(0, 8)}...)` : "-"}
                    </td>
                    <td className="py-3 text-xs text-gray-500 max-w-xs truncate font-mono">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
