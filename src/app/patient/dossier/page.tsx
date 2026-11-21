import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, Heart, Activity, Calendar, Stethoscope, User } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientDossierPage() {
  const session = await getSession();
  if (!session || !session.patientId) {
    redirect("/auth/login");
  }

  const patient = await prisma.patient.findUnique({
    where: { id: session.patientId },
    include: {
      user: true,
      allergies: true,
      antecedents: true,
      representant: { include: { user: true } },
      mineurs: { include: { user: true } },
      consultations: {
        include: {
          medecin: {
            include: { user: { select: { nom: true, prenom: true } } },
          },
          ordonnances: {
            include: {
              lignes: { include: { medicament: true } },
            },
          },
        },
        orderBy: { dateConsultation: "desc" },
      },
    },
  });

  if (!patient) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-7 w-7 text-emerald-600" />
          Mon Dossier Patient Informatisé (DPI)
        </h1>
        <p className="text-gray-500 mt-1">
          Dossier médical unifié et partagé avec vos praticiens autorisés
        </p>
      </div>

      {/* Fiche d'identification */}
      <Card className="border-emerald-200 bg-white">
        <CardHeader className="bg-emerald-50/40 border-b border-emerald-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl text-gray-900">
                {patient.user.prenom} {patient.user.nom}
              </CardTitle>
              <CardDescription className="text-emerald-700 font-semibold font-mono">
                Identifiant Unique: {patient.numDossier}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {patient.estMineur && patient.representant && (
                <Badge variant="warning">
                  Mineur sous tutelle de: {patient.representant.user.prenom} {patient.representant.user.nom}
                </Badge>
              )}
              <Badge variant="info">Groupe Sanguin: {patient.groupeSanguin || "Non renseigné"}</Badge>
              <Badge variant="outline">Sexe: {patient.sexe === "M" ? "Masculin" : "Féminin"}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Date de naissance:</span>
              <p className="font-medium text-gray-900">
                {new Date(patient.dateNaissance).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Téléphone:</span>
              <p className="font-medium text-gray-900">{patient.user.telephone || "Non renseigné"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Adresse de résidence:</span>
              <p className="font-medium text-gray-900">{patient.adresse || "Conakry, Guinée"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies & Antécédents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Allergies Connues ({patient.allergies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.allergies.length === 0 ? (
              <p className="text-sm text-gray-400 py-3">Aucune allergie signalée</p>
            ) : (
              <div className="space-y-2">
                {patient.allergies.map((a) => (
                  <div key={a.id} className="p-2.5 bg-red-50/60 border border-red-200 rounded-lg text-sm">
                    <p className="font-semibold text-red-900">{a.substance}</p>
                    {a.reaction && <p className="text-xs text-red-700">{a.reaction}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-600">
              <Activity className="h-5 w-5" />
              Antécédents Médicaux ({patient.antecedents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.antecedents.length === 0 ? (
              <p className="text-sm text-gray-400 py-3">Aucun antécédent répertorié</p>
            ) : (
              <div className="space-y-2">
                {patient.antecedents.map((ant) => (
                  <div key={ant.id} className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-sm">
                    <p className="font-semibold text-blue-900">{ant.description}</p>
                    <p className="text-xs text-blue-600 uppercase tracking-wide">{ant.type}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique des consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            Historique des Consultations & Soins ({patient.consultations.length})
          </CardTitle>
          <CardDescription>
            Toutes vos consultations consignées par les médecins praticiens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patient.consultations.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Aucune consultation enregistrée</div>
          ) : (
            <div className="space-y-6">
              {patient.consultations.map((c) => (
                <div key={c.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        Motif: {c.motif}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dr. {c.medecin.user.prenom} {c.medecin.user.nom} ({c.medecin.structure})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {new Date(c.dateConsultation).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Badge>
                    </div>
                  </div>

                  {c.diagnostic && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Diagnostic posé :</span>{" "}
                      <span className="text-gray-900">{c.diagnostic}</span>
                    </div>
                  )}

                  {/* Constantes */}
                  {(c.tension || c.temperature || c.poids) && (
                    <div className="flex flex-wrap gap-4 text-xs bg-white p-2.5 rounded-lg border border-gray-200">
                      {c.tension && <span><strong>Tension:</strong> {c.tension} mmHg</span>}
                      {c.temperature && <span><strong>Température:</strong> {c.temperature} °C</span>}
                      {c.poids && <span><strong>Poids:</strong> {c.poids} kg</span>}
                    </div>
                  )}

                  {c.notes && (
                    <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                      <strong>Notes du médecin:</strong> {c.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
