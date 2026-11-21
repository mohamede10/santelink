import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Package } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PharmacienMedicamentsPage() {
  const session = await getSession();
  if (!session || !session.pharmacienId) {
    redirect("/auth/login");
  }

  const medicaments = await prisma.medicament.findMany({
    orderBy: { nomDci: "asc" },
    include: {
      stocks: {
        where: { pharmacienId: session.pharmacienId },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="h-7 w-7 text-emerald-600" />
            Nomenclature des Spécialités Pharmaceutiques
          </h1>
          <p className="text-gray-500 mt-1">
            Consultez le catalogue national et ajoutez des molécules à vos stocks officinaux
          </p>
        </div>

        <Link href="/pharmacien/stock">
          <Button>
            <Package className="h-4 w-4" />
            Gérer mon stock
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spécialités enregistrées ({medicaments.length})</CardTitle>
          <CardDescription>
            Toutes les spécialités pharmaceutiques répertoriées pour la prescription et la délivrance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="py-3">Dénomination (DCI)</th>
                  <th className="py-3">Nom Commercial</th>
                  <th className="py-3">Forme & Dosage</th>
                  <th className="py-3">Catégorie</th>
                  <th className="py-3 text-center">Mon stock</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {medicaments.map((m) => {
                  const monStock = m.stocks[0];
                  return (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-semibold text-gray-900">
                        {m.nomDci}
                      </td>
                      <td className="py-3 text-gray-600">
                        {m.nomCommercial || "-"}
                      </td>
                      <td className="py-3 text-gray-700">
                        {m.dosage} — {m.forme}
                      </td>
                      <td className="py-3">
                        {m.categorie ? <Badge variant="outline">{m.categorie}</Badge> : "-"}
                      </td>
                      <td className="py-3 text-center">
                        {monStock ? (
                          <Badge variant={monStock.quantite <= monStock.seuilAlerte ? "warning" : "success"}>
                            {monStock.quantite} en stock
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">Non référencé</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link href="/pharmacien/stock">
                          <Button variant="outline" size="sm">
                            {monStock ? "Modifier" : "Ajouter"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
