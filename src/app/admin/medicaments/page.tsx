import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMedicamentsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const medicaments = await prisma.medicament.findMany({
    orderBy: { nomDci: "asc" },
    include: {
      _count: {
        select: {
          stocks: true,
          lignesOrdonnance: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="h-7 w-7 text-emerald-600" />
            Nomenclature Nationale des Médicaments
          </h1>
          <p className="text-gray-500 mt-1">
            Référentiel des spécialités pharmaceutiques autorisées en République de Guinée ({medicaments.length} spécialités)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des Médicaments</CardTitle>
          <CardDescription>
            Ces molécules sont disponibles pour les prescriptions médicales et le suivi des stocks en officine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="py-3">Dénomination Commune (DCI)</th>
                  <th className="py-3">Nom Commercial</th>
                  <th className="py-3">Dosage & Forme</th>
                  <th className="py-3">Voie d&apos;admin.</th>
                  <th className="py-3">Catégorie</th>
                  <th className="py-3 text-center">Pharmacies détentrices</th>
                  <th className="py-3 text-right">Prescriptions</th>
                </tr>
              </thead>
              <tbody>
                {medicaments.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold text-gray-900">
                      {m.nomDci}
                    </td>
                    <td className="py-3 text-gray-600">
                      {m.nomCommercial || "-"}
                    </td>
                    <td className="py-3 text-gray-700">
                      <span className="font-medium">{m.dosage}</span> — {m.forme}
                    </td>
                    <td className="py-3 text-gray-600">
                      <Badge variant="outline">{m.voieAdmin}</Badge>
                    </td>
                    <td className="py-3 text-gray-600">
                      {m.categorie ? <Badge variant="info">{m.categorie}</Badge> : "-"}
                    </td>
                    <td className="py-3 text-center font-medium text-gray-800">
                      {m._count.stocks}
                    </td>
                    <td className="py-3 text-right font-medium text-emerald-700">
                      {m._count.lignesOrdonnance}
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
