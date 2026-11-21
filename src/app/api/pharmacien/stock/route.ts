import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";
import { z } from "zod";

// GET: Lister le stock du pharmacien connecté
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PHARMACIEN" || !session.pharmacienId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";

  const stocks = await prisma.stockMedicament.findMany({
    where: {
      pharmacienId: session.pharmacienId,
      ...(search
        ? {
            medicament: {
              OR: [
                { nomDci: { contains: search, mode: "insensitive" } },
                { nomCommercial: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      medicament: true,
    },
    orderBy: { medicament: { nomDci: "asc" } },
  });

  return NextResponse.json({ stocks });
}

// POST: Ajouter ou mettre à jour le stock d'un médicament
const stockSchema = z.object({
  medicamentId: z.string().uuid(),
  quantite: z.number().int().min(0),
  prixUnitaire: z.number().optional(),
  seuilAlerte: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PHARMACIEN" || !session.pharmacienId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = stockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Données invalides" }, { status: 400 });
    }

    const data = parsed.data;

    const stock = await prisma.stockMedicament.upsert({
      where: {
        pharmacienId_medicamentId: {
          pharmacienId: session.pharmacienId,
          medicamentId: data.medicamentId,
        },
      },
      update: {
        quantite: data.quantite,
        prixUnitaire: data.prixUnitaire ?? undefined,
        seuilAlerte: data.seuilAlerte ?? undefined,
      },
      create: {
        pharmacienId: session.pharmacienId,
        medicamentId: data.medicamentId,
        quantite: data.quantite,
        prixUnitaire: data.prixUnitaire ?? null,
        seuilAlerte: data.seuilAlerte ?? 10,
      },
      include: { medicament: true },
    });

    await logAudit(session.id, "UPDATE_STOCK", "StockMedicament", stock.id, {
      medicamentId: data.medicamentId,
      quantite: data.quantite,
    });

    return NextResponse.json({ success: true, stock });
  } catch (err: unknown) {
    console.error("Stock error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
