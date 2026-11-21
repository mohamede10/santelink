import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Pill, FileText, QrCode, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Statistiques globales
  const [
    totalUsers,
    pendingUsers,
    totalPatients,
    totalMedecins,
    totalPharmaciens,
    totalConsultations,
    totalOrdonnances,
    recentAudits,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { statutCompte: "EN_ATTENTE" } }),
    prisma.patient.count(),
    prisma.medecin.count(),
    prisma.pharmacien.count(),
    prisma.consultation.count(),
    prisma.ordonnance.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nom: true, prenom: true, role: true } } },
    }),
  ]);

  const stats = [
    { label: "Utilisateurs", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "En attente", value: pendingUsers, icon: UserCheck, color: "text-amber-600 bg-amber-50" },
    { label: "Patients", value: totalPatients, icon: Activity, color: "text-emerald-600 bg-emerald-50" },
    { label: "Médecins", value: totalMedecins, icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    { label: "Pharmaciens", value: totalPharmaciens, icon: Pill, color: "text-purple-600 bg-purple-50" },
    { label: "Ordonnances", value: totalOrdonnances, icon: QrCode, color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme SantéLink</p>
      </div>

      {/* Alerte comptes en attente */}
      {pendingUsers > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">
              {pendingUsers} compte{pendingUsers > 1 ? "s" : ""} professionnel{pendingUsers > 1 ? "s" : ""} en attente de validation
            </p>
            <p className="text-sm text-amber-600">
              Conformément aux règles RG-01/02, chaque professionnel doit être validé avant activation
            </p>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journal d'audit récent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journal d&apos;audit récent (RG-08)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Utilisateur</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Action</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-2 text-gray-600">
                      {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-gray-900">
                      {log.user.prenom} {log.user.nom}
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge variant={log.action === "LOGIN" ? "info" : "default"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">{log.user.role}</td>
                  </tr>
                ))}
                {recentAudits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      Aucune activité enregistrée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
