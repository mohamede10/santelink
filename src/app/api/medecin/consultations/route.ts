import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";
import QRCode from "qrcode";

const consultationSchema = z.object({
  patientId: z.string().uuid(),
  typeConsultation: z.enum(["PREMIERE_VISITE", "SUIVI", "URGENCE", "TELECONSULTATION"]).default("PREMIERE_VISITE"),
  motif: z.string().min(3),
  diagnostic: z.string().optional(),
  notes: z.string().optional(),
  poids: z.number().optional(),
  taille: z.number().optional(),
  tension: z.string().optional(),
  temperature: z.number().optional(),
  // Ordonnance optionnelle
  ordonnance: z.object({
    dateExpiration: z.string(),
    notes: z.string().optional(),
    lignes: z.array(z.object({
      medicamentId: z.string().uuid(),
      posologie: z.string(),
      duree: z.string(),
      quantite: z.number().int().positive(),
      instructions: z.string().optional(),
    })).min(1),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MEDECIN" || !session.medecinId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = consultationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Données invalides" }, { status: 400 });
    }

    const data = parsed.data;

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Créer la consultation
      const consultation = await tx.consultation.create({
        data: {
          patientId: data.patientId,
          medecinId: session.medecinId!,
          typeConsultation: data.typeConsultation,
          motif: data.motif,
          diagnostic: data.diagnostic || null,
          notes: data.notes || null,
          poids: data.poids ?? null,
          taille: data.taille ?? null,
          tension: data.tension || null,
          temperature: data.temperature ?? null,
        },
      });

      let ordonnance = null;
      let qrCodeDataUrl = null;

      // Si ordonnance fournie, la créer (RG-06)
      if (data.ordonnance) {
        // Générer le hash QR unique (RG-06)
        const qrPayload = `${consultation.id}:${Date.now()}:${crypto.randomUUID()}`;
        const qrCodeHash = crypto
          .createHmac("sha256", process.env.QR_SECRET_KEY || "SANTELINK_QR_SECRET")
          .update(qrPayload)
          .digest("hex");

        ordonnance = await tx.ordonnance.create({
          data: {
            consultationId: consultation.id,
            patientId: data.patientId,
            medecinId: session.medecinId!,
            qrCodeHash,
            dateExpiration: new Date(data.ordonnance.dateExpiration),
            notes: data.ordonnance.notes || null,
            lignes: {
              create: data.ordonnance.lignes.map((l) => ({
                medicamentId: l.medicamentId,
                posologie: l.posologie,
                duree: l.duree,
                quantite: l.quantite,
                instructions: l.instructions || null,
              })),
            },
          },
          include: { lignes: true },
        });

        // Générer le QR code en data URL
        const qrData = JSON.stringify({
          id: ordonnance.id,
          hash: qrCodeHash,
          patient: `${patient.numDossier}`,
          date: ordonnance.dateEmission,
        });
        qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
      }

      return { consultation, ordonnance, qrCodeDataUrl };
    });

    // Audit (RG-08)
    await logAudit(session.id, "CREATE_CONSULTATION", "Consultation", result.consultation.id, {
      patientId: data.patientId,
      hasOrdonnance: !!result.ordonnance,
    });

    return NextResponse.json({
      success: true,
      consultation: result.consultation,
      ordonnance: result.ordonnance,
      qrCode: result.qrCodeDataUrl,
    });
  } catch (err: unknown) {
    console.error("Consultation error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET: Liste des consultations du médecin connecté
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MEDECIN" || !session.medecinId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where = {
    medecinId: session.medecinId,
    ...(patientId ? { patientId } : {}),
  };

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dateConsultation: "desc" },
      include: {
        patient: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
        ordonnances: { select: { id: true, statut: true, qrCodeHash: true } },
      },
    }),
    prisma.consultation.count({ where }),
  ]);

  return NextResponse.json({ consultations, total, page, totalPages: Math.ceil(total / limit) });
}
