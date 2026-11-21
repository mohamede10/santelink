import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, QrCode, Pill, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PharmacienDashboard() {
  const session = await getSession();
  if (!session?.pharmacienId) return null;

  const [
    totalMedicaments,
    stocksFaibles,
    totalDelivrances,
    dernieresDelivrances,
  ] = await Promise.all([
    prisma.stockMedicament.count({ where: { pharmacienId: session.pharmacienId } }),
    prisma.stockMedicament.count({
      where: {
        pharmacienId: session.pharmacienId,
        quantite: { lte: 10 },
      },
    }),
    prisma.delivrance.count({ where: { pharmacienId: session.pharmacienId } }),
    prisma.delivrance.findMany({
      where: { pharmacienId: session.pharmacienId },
      take: 5,
      orderBy: { dateDelivrance: "desc" },
      include: {
        ordonnance: {
          include: {
            patient: {
              include: { user: { select: { nom: true, prenom: true } } },
            },
          },
        },
      },
    }),
  ]);

  const stats = [
    { label: "Médicaments en stock", value: totalMedicaments, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Stocks faibles", value: stocksFaibles, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Délivrances", value: totalDelivrances, icon: Pill, color: "text-emerald-600 bg-emerald-50" },
    { label: "Ordonnances traitées", value: totalDelivrances, icon: QrCode, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{session.nomOfficine}</h1>
        <p className="text-gray-500 mt-1">Tableau de bord pharmacien</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Alertes stock */}
      {stocksFaibles > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="font-medium text-red-800">
            {stocksFaibles} médicament{stocksFaibles > 1 ? "s" : ""} en dessous du seuil d&apos;alerte
          </p>
        </div>
      )}

      {/* Dernières délivrances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dernières délivrances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dernieresDelivrances.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {d.ordonnance.patient.user.prenom} {d.ordonnance.patient.user.nom}
                  </p>
                  <p className="text-xs text-gray-500">Ordonnance: {d.ordonnance.id.slice(0, 8)}...</p>
                </div>
                <div className="text-right">
                  <Badge variant={d.ordonnance.statut === "DELIVREE" ? "success" : "warning"}>
                    {d.ordonnance.statut}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(d.dateDelivrance).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
            {dernieresDelivrances.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune délivrance enregistrée</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
