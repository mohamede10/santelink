import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, CheckCircle2, User, QrCode } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PharmacienDelivrancesPage() {
  const session = await getSession();
  if (!session || !session.pharmacienId) {
    redirect("/auth/login");
  }

  const delivrances = await prisma.delivrance.findMany({
    where: { pharmacienId: session.pharmacienId },
    include: {
      ordonnance: {
        include: {
          patient: {
            include: { user: { select: { nom: true, prenom: true } } },
          },
          medecin: {
            include: { user: { select: { nom: true, prenom: true } } },
          },
        },
      },
      lignes: {
        include: {
          ligneOrdonnance: {
            include: { medicament: true },
          },
        },
      },
    },
    orderBy: { dateDelivrance: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Pill className="h-7 w-7 text-emerald-600" />
          Historique des Délivrances Officinales
        </h1>
        <p className="text-gray-500 mt-1">
          Registre sécurisé des ordonnances scannées et servies dans votre officine ({delivrances.length} délivrances)
        </p>
      </div>

      <div className="space-y-4">
        {delivrances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">Aucune délivrance enregistrée</p>
              <p className="text-sm mt-1">Les ordonnances validées via le scanner QR apparaîtront dans ce registre.</p>
            </CardContent>
          </Card>
        ) : (
          delivrances.map((d) => (
            <Card key={d.id} className="hover:shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-gray-900">
                        Patient : {d.ordonnance.patient.user.prenom} {d.ordonnance.patient.user.nom}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        (Ord. {d.ordonnance.id.slice(0, 8)}...)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Prescrit par Dr. {d.ordonnance.medecin.user.prenom} {d.ordonnance.medecin.user.nom}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant="success">Délivrée</Badge>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {new Date(d.dateDelivrance).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Médicaments délivrés :</span>
                  <div className="flex flex-wrap gap-2">
                    {d.lignes.map((l) => (
                      <span
                        key={l.id}
                        className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium"
                      >
                        {l.ligneOrdonnance.medicament.nomDci} {l.ligneOrdonnance.medicament.dosage} — Qté: {l.quantiteDelivree}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
