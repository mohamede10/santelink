export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";
import crypto from "crypto";

// POST: Scanner et vérifier une ordonnance via QR code (RG-06/07)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PHARMACIEN" || !session.pharmacienId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { qrData } = await req.json();

    if (!qrData) {
      return NextResponse.json({ error: "Données QR manquantes" }, { status: 400 });
    }

    // Décoder les données QR
    let parsed: { id: string; hash: string };
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return NextResponse.json({ error: "QR code invalide ou corrompu" }, { status: 400 });
    }

    // Trouver l'ordonnance
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: parsed.id },
      include: {
        patient: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
        medecin: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
        lignes: {
          include: {
            medicament: true,
            delivrances: true,
          },
        },
        delivrances: true,
      },
    });

    if (!ordonnance) {
      return NextResponse.json({ error: "Ordonnance introuvable" }, { status: 404 });
    }

    // Vérifier l'intégrité du hash
    if (ordonnance.qrCodeHash !== parsed.hash) {
      await logAudit(session.id, "SCAN_QR_INVALID", "Ordonnance", parsed.id);
      return NextResponse.json({ error: "QR code falsifié ou invalide" }, { status: 403 });
    }

    // Vérifier le statut (RG-07)
    if (ordonnance.statut === "DELIVREE") {
      return NextResponse.json({
        error: "Cette ordonnance a déjà été intégralement délivrée",
        ordonnance: { id: ordonnance.id, statut: ordonnance.statut },
      }, { status: 409 });
    }

    if (ordonnance.statut === "EXPIREE" || new Date() > ordonnance.dateExpiration) {
      // Auto-verrouiller si expirée
      if (ordonnance.statut !== "EXPIREE") {
        await prisma.ordonnance.update({
          where: { id: ordonnance.id },
          data: { statut: "EXPIREE" },
        });
      }
      return NextResponse.json({
        error: "Cette ordonnance est expirée",
        ordonnance: { id: ordonnance.id, statut: "EXPIREE" },
      }, { status: 410 });
    }

    if (ordonnance.statut === "ANNULEE") {
      return NextResponse.json({ error: "Cette ordonnance a été annulée" }, { status: 409 });
    }

    // Audit
    await logAudit(session.id, "SCAN_QR_SUCCESS", "Ordonnance", ordonnance.id);

    return NextResponse.json({
      success: true,
      ordonnance: {
        id: ordonnance.id,
        statut: ordonnance.statut,
        dateEmission: ordonnance.dateEmission,
        dateExpiration: ordonnance.dateExpiration,
        patient: {
          nom: ordonnance.patient.user.nom,
          prenom: ordonnance.patient.user.prenom,
        },
        medecin: {
          nom: ordonnance.medecin.user.nom,
          prenom: ordonnance.medecin.user.prenom,
        },
        lignes: ordonnance.lignes.map((l) => ({
          id: l.id,
          medicament: l.medicament.nomDci,
          forme: l.medicament.forme,
          dosage: l.medicament.dosage,
          posologie: l.posologie,
          duree: l.duree,
          quantite: l.quantite,
          quantiteDelivree: l.delivrances.reduce((sum, d) => sum + d.quantiteDelivree, 0),
          resteADelivrer: l.quantite - l.delivrances.reduce((sum, d) => sum + d.quantiteDelivree, 0),
        })),
      },
    });
  } catch (err: unknown) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
