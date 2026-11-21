import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, Pill, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PharmacienStatistiquesPage() {
  const session = await getSession();
  if (!session || !session.pharmacienId) {
    redirect("/auth/login");
  }

  const [
    totalMedicaments,
    totalDelivrances,
    stocksFaibles,
  ] = await Promise.all([
    prisma.stockMedicament.count({ where: { pharmacienId: session.pharmacienId } }),
    prisma.delivrance.count({ where: { pharmacienId: session.pharmacienId } }),
    prisma.stockMedicament.count({
      where: {
        pharmacienId: session.pharmacienId,
        quantite: { lte: 10 },
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-emerald-600" />
          Statistiques & Performance Officinale
        </h1>
        <p className="text-gray-500 mt-1">
          Suivi de l&apos;activité de délivrance et de l&apos;état des approvisionnements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Références gérées</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalMedicaments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Ordonnances honorées</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalDelivrances}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-gray-500 uppercase font-semibold">Alertes réapprovisionnement</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{stocksFaibles}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
