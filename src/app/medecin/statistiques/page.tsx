import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, QrCode, FileText } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MedecinStatistiquesPage() {
  const session = await getSession();
  if (!session || !session.medecinId) {
    redirect("/auth/login");
  }

  const [
    totalConsultations,
    totalOrdonnances,
    patientsDistincts,
    ordonnancesDelivrees,
  ] = await Promise.all([
    prisma.consultation.count({ where: { medecinId: session.medecinId } }),
    prisma.ordonnance.count({ where: { medecinId: session.medecinId } }),
    prisma.consultation.groupBy({
      by: ["patientId"],
      where: { medecinId: session.medecinId },
    }).then((r) => r.length),
    prisma.ordonnance.count({
      where: { medecinId: session.medecinId, statut: "DELIVREE" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-7 w-7 text-emerald-600" />
          Mes Statistiques d&apos;Activité Médicale
        </h1>
        <p className="text-gray-500 mt-1">
          Bilan de vos consultations et suivi de l&apos;observance des prescriptions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Patients suivis</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patientsDistincts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Consultations</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalConsultations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Ordonnances émises</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrdonnances}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Taux de délivrance</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {totalOrdonnances > 0 ? `${Math.round((ordonnancesDelivrees / totalOrdonnances) * 100)}%` : "0%"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
