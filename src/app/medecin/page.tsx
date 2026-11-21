import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, QrCode, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MedecinDashboard() {
  const session = await getSession();
  if (!session?.medecinId) return null;

  const [
    totalPatients,
    totalConsultations,
    totalOrdonnances,
    rdvAujourdhui,
    dernieresConsultations,
  ] = await Promise.all([
    prisma.consultation.groupBy({
      by: ["patientId"],
      where: { medecinId: session.medecinId },
    }).then((r) => r.length),
    prisma.consultation.count({ where: { medecinId: session.medecinId } }),
    prisma.ordonnance.count({ where: { medecinId: session.medecinId } }),
    prisma.rendezVous.count({
      where: {
        medecinId: session.medecinId,
        dateHeure: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        statut: { in: ["PLANIFIE", "CONFIRME"] },
      },
    }),
    prisma.consultation.findMany({
      where: { medecinId: session.medecinId },
      take: 5,
      orderBy: { dateConsultation: "desc" },
      include: {
        patient: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
    }),
  ]);

  const stats = [
    { label: "Mes patients", value: totalPatients, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Consultations", value: totalConsultations, icon: FileText, color: "text-emerald-600 bg-emerald-50" },
    { label: "Ordonnances", value: totalOrdonnances, icon: QrCode, color: "text-purple-600 bg-purple-50" },
    { label: "RDV aujourd'hui", value: rdvAujourdhui, icon: Calendar, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, Dr. {session.prenom} {session.nom}
        </h1>
        <p className="text-gray-500 mt-1">{session.structure}</p>
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

      {/* Dernières consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dernières consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dernieresConsultations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {c.patient.user.prenom} {c.patient.user.nom}
                  </p>
                  <p className="text-sm text-gray-500">{c.motif}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(c.dateConsultation).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs text-gray-400">{c.typeConsultation.replace("_", " ")}</p>
                </div>
              </div>
            ))}
            {dernieresConsultations.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune consultation enregistrée</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
