import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, QrCode, Pill, Activity, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminStatistiquesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [
    totalPatients,
    totalMedecins,
    totalPharmaciens,
    totalConsultations,
    totalOrdonnances,
    totalDelivrances,
    ordonnancesValides,
    ordonnancesDelivrees,
    medicamentsPopulaires,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.medecin.count(),
    prisma.pharmacien.count(),
    prisma.consultation.count(),
    prisma.ordonnance.count(),
    prisma.delivrance.count(),
    prisma.ordonnance.count({ where: { statut: "VALIDE" } }),
    prisma.ordonnance.count({ where: { statut: "DELIVREE" } }),
    prisma.medicament.findMany({
      take: 5,
      include: { _count: { select: { lignesOrdonnance: true } } },
      orderBy: { lignesOrdonnance: { _count: "desc" } },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-emerald-600" />
          Statistiques Sanitaires & Tableaux de Bord
        </h1>
        <p className="text-gray-500 mt-1">
          Indicateurs épidémiologiques et logistiques agrégés pour le pilotage sanitaire en Guinée (Section 6)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Taux de Délivrance Sécurisée</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {totalOrdonnances > 0 ? `${Math.round((ordonnancesDelivrees / totalOrdonnances) * 100)}%` : "0%"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{ordonnancesDelivrees} délivrées sur {totalOrdonnances} émises</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Couverture Sanitaire</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">
                  {totalPatients}
                </p>
                <p className="text-xs text-gray-400 mt-1">Dossiers patients informatisés actifs</p>
              </div>
              <Users className="h-10 w-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Activité Médicale</p>
                <p className="text-3xl font-extrabold text-purple-600 mt-1">
                  {totalConsultations}
                </p>
                <p className="text-xs text-gray-400 mt-1">Consultations enregistrées</p>
              </div>
              <Activity className="h-10 w-10 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Médicaments les plus prescrits</CardTitle>
            <CardDescription>Données issues des ordonnances générées sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicamentsPopulaires.map((m, idx) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nomDci}</p>
                      <p className="text-xs text-gray-500">{m.dosage} — {m.forme}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {m._count.lignesOrdonnance} prescription(s)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Acteurs Professionnels</CardTitle>
            <CardDescription>Réseau de soins de la phase pilote (Conakry)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Praticiens Médecins</span>
                <span className="font-bold text-gray-900">{totalMedecins}</span>
              </div>
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Officines Pharmaceutiques</span>
                <span className="font-bold text-gray-900">{totalPharmaciens}</span>
              </div>
              <div className="p-3 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ordonnances Actives en circulation</span>
                <span className="font-bold text-emerald-600">{ordonnancesValides}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
