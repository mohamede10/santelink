export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const medicaments = await prisma.medicament.findMany({
    where: q
      ? {
          OR: [
            { nomDci: { contains: q, mode: "insensitive" } },
            { nomCommercial: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nomDci: "asc" },
    take: 100,
  });

  return NextResponse.json({ medicaments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nomDci, nomCommercial, forme, dosage, voieAdmin, categorie } = body;

    if (!nomDci || !forme || !dosage) {
      return NextResponse.json({ error: "DCI, forme et dosage sont obligatoires" }, { status: 400 });
    }

    const medicament = await prisma.medicament.upsert({
      where: {
        nomDci_forme_dosage: {
          nomDci,
          forme,
          dosage,
        },
      },
      update: {
        nomCommercial: nomCommercial || null,
        voieAdmin: voieAdmin || "Orale",
        categorie: categorie || null,
      },
      create: {
        nomDci,
        nomCommercial: nomCommercial || null,
        forme,
        dosage,
        voieAdmin: voieAdmin || "Orale",
        categorie: categorie || null,
      },
    });

    await logAudit(session.id, "CREATE_MEDICAMENT", "Medicament", medicament.id, { nomDci, dosage, forme });

    return NextResponse.json({ success: true, medicament });
  } catch (err: unknown) {
    console.error("Medicament create error:", err);
    return NextResponse.json({ error: "Erreur lors de la création du médicament" }, { status: 500 });
  }
}
