export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWhatsAppLink } from "@/lib/utils";

// GET: Rechercher un médicament et les pharmacies qui l'ont en stock
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("q") || "";

  if (search.length < 2) {
    return NextResponse.json({ error: "Recherche trop courte (min. 2 caractères)" }, { status: 400 });
  }

  const results = await prisma.stockMedicament.findMany({
    where: {
      quantite: { gt: 0 },
      medicament: {
        OR: [
          { nomDci: { contains: search, mode: "insensitive" } },
          { nomCommercial: { contains: search, mode: "insensitive" } },
        ],
      },
    },
    include: {
      medicament: true,
      pharmacien: {
        include: {
          user: { select: { nom: true, prenom: true } },
        },
      },
    },
    orderBy: { medicament: { nomDci: "asc" } },
    take: 50,
  });

  const pharmacies = results.map((r) => ({
    medicament: {
      id: r.medicament.id,
      nomDci: r.medicament.nomDci,
      nomCommercial: r.medicament.nomCommercial,
      forme: r.medicament.forme,
      dosage: r.medicament.dosage,
    },
    pharmacie: {
      id: r.pharmacien.id,
      nomOfficine: r.pharmacien.nomOfficine,
      adresse: r.pharmacien.adresseOfficine,
      telephone: r.pharmacien.telephoneOfficine,
      whatsappLink: r.pharmacien.whatsapp
        ? getWhatsAppLink(
            r.pharmacien.whatsapp,
            `Bonjour, je souhaite vérifier la disponibilité de ${r.medicament.nomDci} ${r.medicament.dosage} (${r.medicament.forme}). Merci.`
          )
        : null,
    },
    quantite: r.quantite,
    prixUnitaire: r.prixUnitaire,
  }));

  return NextResponse.json({ results: pharmacies, total: pharmacies.length });
}
