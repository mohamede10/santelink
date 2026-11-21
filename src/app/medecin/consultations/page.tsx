import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, User, Calendar, QrCode } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MedecinConsultationsPage() {
  const session = await getSession();
  if (!session || !session.medecinId) {
    redirect("/auth/login");
  }

  const consultations = await prisma.consultation.findMany({
    where: { medecinId: session.medecinId },
    include: {
      patient: {
        include: { user: { select: { nom: true, prenom: true } } },
      },
      ordonnances: {
        include: {
          lignes: { include: { medicament: true } },
        },
      },
    },
    orderBy: { dateConsultation: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-emerald-600" />
            Mes Consultations Médicales
          </h1>
          <p className="text-gray-500 mt-1">
            Historique des actes médicaux et des diagnostics posés ({consultations.length} actes)
          </p>
        </div>

        <Link href="/medecin/ordonnances">
          <Button>
            <Plus className="h-4 w-4" />
            Nouvelle consultation & ordonnance
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">Aucune consultation enregistrée</p>
            </CardContent>
          </Card>
        ) : (
          consultations.map((c) => (
            <Card key={c.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="font-bold text-gray-900 text-base">
                      {c.patient.user.prenom} {c.patient.user.nom}
                    </span>
                    <Badge variant="info" className="font-mono text-xs">
                      {c.patient.numDossier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.typeConsultation.replace("_", " ")}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(c.dateConsultation).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Motif de consultation:</span>
                    <p className="text-gray-900 font-medium">{c.motif}</p>
                    {c.diagnostic && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-gray-500">Diagnostic:</span>
                        <p className="text-emerald-800 font-semibold">{c.diagnostic}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    {c.ordonnances.length > 0 ? (
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <QrCode className="h-3.5 w-3.5" />
                            Ordonnance associée
                          </span>
                          <Badge variant={c.ordonnances[0].statut === "VALIDE" ? "success" : "default"}>
                            {c.ordonnances[0].statut}
                          </Badge>
                        </div>
                        <p className="text-xs text-emerald-800">
                          {c.ordonnances[0].lignes.map((l) => l.medicament.nomDci).join(", ")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sans ordonnance médicale</span>
                    )}
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
