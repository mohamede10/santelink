export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PHARMACIEN" || !session.pharmacienId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { ordonnanceId, lignes } = await req.json();

    if (!ordonnanceId || !Array.isArray(lignes) || lignes.length === 0) {
      return NextResponse.json({ error: "Données de délivrance incomplètes" }, { status: 400 });
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      include: {
        lignes: { include: { medicament: true } },
      },
    });

    if (!ordonnance) {
      return NextResponse.json({ error: "Ordonnance introuvable" }, { status: 404 });
    }

    if (ordonnance.statut === "DELIVREE") {
      return NextResponse.json(
        { error: "Cette ordonnance a déjà été intégralement délivrée et verrouillée (RG-07)." },
        { status: 409 }
      );
    }

    if (ordonnance.statut === "EXPIREE" || new Date() > ordonnance.dateExpiration) {
      return NextResponse.json(
        { error: "Cette ordonnance est expirée." },
        { status: 410 }
      );
    }

    // Effectuer la délivrance dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer la fiche de délivrance
      const delivrance = await tx.delivrance.create({
        data: {
          ordonnanceId,
          pharmacienId: session.pharmacienId!,
        },
      });

      // 2. Traiter chaque ligne et décrémenter le stock de l'officine
      for (const item of lignes) {
        // Enregistrer la ligne de délivrance
        await tx.delivranceLigne.create({
          data: {
            delivranceId: delivrance.id,
            ligneOrdonnanceId: item.ligneOrdonnanceId,
            quantiteDelivree: item.quantiteDelivree,
          },
        });

        // Décrémenter le stock si le pharmacien gère ce médicament
        const ligneOrd = ordonnance.lignes.find((l) => l.id === item.ligneOrdonnanceId);
        if (ligneOrd) {
          const stock = await tx.stockMedicament.findUnique({
            where: {
              pharmacienId_medicamentId: {
                pharmacienId: session.pharmacienId!,
                medicamentId: ligneOrd.medicamentId,
              },
            },
          });

          if (stock && stock.quantite >= item.quantiteDelivree) {
            await tx.stockMedicament.update({
              where: { id: stock.id },
              data: {
                quantite: { decrement: item.quantiteDelivree },
              },
            });
          }
        }
      }

      // 3. Verrouiller l'ordonnance en statut DELIVREE (RG-07)
      const updatedOrdonnance = await tx.ordonnance.update({
        where: { id: ordonnanceId },
        data: { statut: "DELIVREE" },
      });

      return { delivrance, updatedOrdonnance };
    });

    // Journal d'audit (RG-08)
    await logAudit(session.id, "DELIVRANCE_COMPLETE", "Ordonnance", ordonnanceId, {
      pharmacienId: session.pharmacienId,
      lignesCount: lignes.length,
    });

    return NextResponse.json({
      success: true,
      message: "Ordonnance délivrée avec succès et verrouillée.",
      delivranceId: result.delivrance.id,
    });
  } catch (err: unknown) {
    console.error("Delivrance error:", err);
    return NextResponse.json({ error: "Erreur serveur lors de la délivrance" }, { status: 500 });
  }
}
