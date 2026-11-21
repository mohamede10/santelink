import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, QrCode, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PatientDashboard() {
  const session = await getSession();
  if (!session?.patientId) return null;

  const [
    totalConsultations,
    ordonnancesActives,
    prochainRdv,
    dernieresOrdonnances,
  ] = await Promise.all([
    prisma.consultation.count({ where: { patientId: session.patientId } }),
    prisma.ordonnance.count({
      where: { patientId: session.patientId, statut: "VALIDE" },
    }),
    prisma.rendezVous.findFirst({
      where: {
        patientId: session.patientId,
        dateHeure: { gte: new Date() },
        statut: { in: ["PLANIFIE", "CONFIRME"] },
      },
      orderBy: { dateHeure: "asc" },
      include: {
        medecin: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
    }),
    prisma.ordonnance.findMany({
      where: { patientId: session.patientId },
      take: 5,
      orderBy: { dateEmission: "desc" },
      include: {
        medecin: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
        lignes: {
          include: { medicament: { select: { nomDci: true } } },
        },
      },
    }),
  ]);

  const stats = [
    { label: "Consultations", value: totalConsultations, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "Ordonnances actives", value: ordonnancesActives, icon: QrCode, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session.prenom} {session.nom}
        </h1>
        <p className="text-gray-500 mt-1">Dossier N° {session.numDossier}</p>
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

        {/* Prochain RDV */}
        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-amber-50 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            {prochainRdv ? (
              <>
                <p className="font-medium text-gray-900">
                  Prochain RDV: {new Date(prochainRdv.dateHeure).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="text-sm text-gray-500">
                  Dr. {prochainRdv.medecin.user.prenom} {prochainRdv.medecin.user.nom} — {prochainRdv.motif}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Aucun rendez-vous planifié</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recherche médicament rapide */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-emerald-900">Besoin d&apos;un médicament ?</h3>
            <p className="text-sm text-emerald-700">
              Trouvez les pharmacies qui disposent de vos traitements et contactez-les via WhatsApp.
            </p>
          </div>
          <Link href="/patient/recherche">
            <Button>
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Dernières ordonnances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mes ordonnances récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dernieresOrdonnances.map((o) => (
              <div key={o.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 text-sm">
                    Dr. {o.medecin.user.prenom} {o.medecin.user.nom}
                  </p>
                  <Badge
                    variant={
                      o.statut === "VALIDE" ? "success" :
                      o.statut === "DELIVREE" ? "info" :
                      o.statut === "EXPIREE" ? "danger" : "warning"
                    }
                  >
                    {o.statut}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {o.lignes.map((l) => (
                    <span key={l.id} className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">
                      {l.medicament.nomDci}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Émise le {new Date(o.dateEmission).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
            {dernieresOrdonnances.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune ordonnance</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
