import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, MapPin, Building2, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PatientMessageriePage() {
  const session = await getSession();
  if (!session || !session.patientId) {
    redirect("/auth/login");
  }

  const pharmaciens = await prisma.pharmacien.findMany({
    where: { whatsapp: { not: null } },
    take: 20,
    orderBy: { nomOfficine: "asc" },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-emerald-600" />
          Messagerie & Contact Officinal (Module 5)
        </h1>
        <p className="text-gray-500 mt-1">
          Échangez directement avec les officines partenaires via WhatsApp pour vérifier vos traitements et préparer vos commandes
        </p>
      </div>

      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-emerald-950 text-base">Recherche ciblée de disponibilité</h3>
            <p className="text-sm text-emerald-800 mt-0.5">
              Trouvez immédiatement quelle pharmacie a votre médicament en stock avant de la contacter.
            </p>
          </div>
          <Link href="/patient/recherche">
            <Button>
              <Search className="h-4 w-4" />
              Rechercher par médicament
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pharmacies Partenaires Disponibles sur WhatsApp</CardTitle>
          <CardDescription>
            Contact direct pré-rempli pour poser vos questions aux pharmaciens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmaciens.map((p) => {
              const waLink = p.whatsapp
                ? getWhatsAppLink(
                    p.whatsapp,
                    `Bonjour ${p.nomOfficine}, je vous contacte depuis la plateforme SantéLink au sujet d'une disponibilité de médicament.`
                  )
                : null;

              return (
                <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <Building2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span>{p.nomOfficine}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    {p.adresseOfficine}
                  </p>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">
                      {p.whatsapp || p.telephoneOfficine}
                    </span>

                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Discuter sur WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
