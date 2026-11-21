import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Stethoscope, Calendar, AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import Image from "next/image";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientOrdonnancesPage() {
  const session = await getSession();
  if (!session || !session.patientId) {
    redirect("/auth/login");
  }

  const ordonnances = await prisma.ordonnance.findMany({
    where: { patientId: session.patientId },
    include: {
      medecin: {
        include: { user: { select: { nom: true, prenom: true } } },
      },
      lignes: {
        include: { medicament: true },
      },
    },
    orderBy: { dateEmission: "desc" },
  });

  // Générer les QR codes pour chaque ordonnance
  const ordonnancesWithQR = await Promise.all(
    ordonnances.map(async (ord) => {
      const qrData = JSON.stringify({
        id: ord.id,
        hash: ord.qrCodeHash,
        patient: session.numDossier,
        date: ord.dateEmission,
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 220, margin: 1 });
      return { ...ord, qrCodeUrl };
    })
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="h-7 w-7 text-emerald-600" />
          Mes Ordonnances Sécurisées
        </h1>
        <p className="text-gray-500 mt-1">
          Présentez le QR Code en pharmacie pour une délivrance sécurisée et sans fraude (RG-06/07)
        </p>
      </div>

      {ordonnancesWithQR.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">Aucune ordonnance émise</p>
            <p className="text-sm mt-1">Vos ordonnances médicales apparaîtront ici dès leur émission par un médecin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {ordonnancesWithQR.map((ord) => {
            const isValide = ord.statut === "VALIDE";
            return (
              <Card key={ord.id} className="border-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/70 border-b pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-gray-900">
                          Prescription du Dr. {ord.medecin.user.prenom} {ord.medecin.user.nom}
                        </CardTitle>
                        <Badge
                          variant={
                            ord.statut === "VALIDE" ? "success" :
                            ord.statut === "DELIVREE" ? "info" :
                            ord.statut === "EXPIREE" ? "danger" : "default"
                          }
                        >
                          {ord.statut}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Émise le {new Date(ord.dateEmission).toLocaleDateString("fr-FR")} — Valide jusqu&apos;au{" "}
                        {new Date(ord.dateExpiration).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </div>

                    <div className="text-xs text-gray-500 font-mono">
                      ID: {ord.id.slice(0, 13)}...
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0 text-center">
                      <Image
                        src={ord.qrCodeUrl}
                        alt="QR Code Ordonnance"
                        width={160}
                        height={160}
                        className="rounded-lg mx-auto"
                        unoptimized
                      />
                      <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                        {isValide ? "À scanner en officine" : "Ordonnance verrouillée"}
                      </span>
                    </div>

                    {/* Médicaments prescrits */}
                    <div className="flex-1 space-y-3 w-full">
                      <h4 className="font-semibold text-sm text-gray-900">Médicaments prescrits :</h4>
                      <div className="space-y-2">
                        {ord.lignes.map((l) => (
                          <div key={l.id} className="p-3 bg-gray-50 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {l.medicament.nomDci} ({l.medicament.dosage} - {l.medicament.forme})
                              </p>
                              <p className="text-xs text-gray-600">
                                <strong>Posologie:</strong> {l.posologie} — <strong>Durée:</strong> {l.duree}
                              </p>
                              {l.instructions && (
                                <p className="text-xs text-emerald-700 mt-0.5 italic">
                                  Note: {l.instructions}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <Badge variant="outline">Qté: {l.quantite}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <p className="text-xs text-gray-500 bg-amber-50/50 p-2 rounded border border-amber-200">
                          <strong>Conseils:</strong> {ord.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
