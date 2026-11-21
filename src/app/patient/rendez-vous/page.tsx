import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Clock, MapPin } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientRendezVousPage() {
  const session = await getSession();
  if (!session || !session.patientId) {
    redirect("/auth/login");
  }

  const rendezVous = await prisma.rendezVous.findMany({
    where: { patientId: session.patientId },
    include: {
      medecin: {
        include: { user: { select: { nom: true, prenom: true, telephone: true } } },
      },
    },
    orderBy: { dateHeure: "desc" },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-7 w-7 text-emerald-600" />
          Mes Rendez-vous Médicaux
        </h1>
        <p className="text-gray-500 mt-1">
          Suivi de vos consultations programmées et passées
        </p>
      </div>

      <div className="space-y-4">
        {rendezVous.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">Aucun rendez-vous planifié</p>
              <p className="text-sm mt-1">Vos consultations programmées avec vos praticiens s&apos;afficheront ici.</p>
            </CardContent>
          </Card>
        ) : (
          rendezVous.map((rdv) => (
            <Card key={rdv.id} className="hover:shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-gray-900 text-base">
                        Dr. {rdv.medecin.user.prenom} {rdv.medecin.user.nom}
                      </span>
                      <span className="text-xs text-gray-500">({rdv.medecin.specialite})</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Motif:</strong> {rdv.motif}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {rdv.medecin.structure} — {rdv.medecin.adresseStructure || "Conakry"}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <Badge variant={rdv.statut === "PLANIFIE" ? "info" : rdv.statut === "CONFIRME" ? "success" : "default"}>
                      {rdv.statut}
                    </Badge>
                    <p className="text-xs text-gray-600 font-medium">
                      {new Date(rdv.dateHeure).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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
