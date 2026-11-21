export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJWT, setSessionCookie, logAudit } from "@/lib/auth";
import { generateNumDossier } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  telephone: z.string().optional(),
  role: z.enum(["PATIENT", "MEDECIN", "PHARMACIEN"]),
  // Champs spécifiques médecin
  numOrdre: z.string().optional(),
  specialite: z.string().optional(),
  structure: z.string().optional(),
  // Champs spécifiques pharmacien
  numAutorisation: z.string().optional(),
  nomOfficine: z.string().optional(),
  adresseOfficine: z.string().optional(),
  telephoneOfficine: z.string().optional(),
  whatsapp: z.string().optional(),
  // Champs spécifiques patient
  dateNaissance: z.string().optional(),
  sexe: z.enum(["M", "F"]).optional(),
  adresse: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 });
    }

    // Validation des champs requis par rôle
    if (data.role === "MEDECIN" && (!data.numOrdre || !data.specialite || !data.structure)) {
      return NextResponse.json(
        { error: "Le numéro d'ordre, la spécialité et la structure sont requis pour un médecin" },
        { status: 400 }
      );
    }
    if (data.role === "PHARMACIEN" && (!data.numAutorisation || !data.nomOfficine || !data.adresseOfficine)) {
      return NextResponse.json(
        { error: "Le numéro d'autorisation, le nom et l'adresse de l'officine sont requis pour un pharmacien" },
        { status: 400 }
      );
    }
    if (data.role === "PATIENT" && (!data.dateNaissance || !data.sexe)) {
      return NextResponse.json(
        { error: "La date de naissance et le sexe sont requis pour un patient" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    // RG-01/02: Les professionnels sont EN_ATTENTE, les patients sont VALIDE directement
    const statutCompte = data.role === "PATIENT" ? "VALIDE" : "EN_ATTENTE";

    // Transaction: créer user + profil spécifique
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone || null,
          role: data.role,
          statutCompte,
        },
      });

      // Créer le profil spécifique au rôle
      if (data.role === "PATIENT") {
        await tx.patient.create({
          data: {
            userId: newUser.id,
            numDossier: generateNumDossier(),
            dateNaissance: new Date(data.dateNaissance!),
            sexe: data.sexe!,
            adresse: data.adresse || null,
          },
        });
      } else if (data.role === "MEDECIN") {
        await tx.medecin.create({
          data: {
            userId: newUser.id,
            numOrdre: data.numOrdre!,
            specialite: data.specialite!,
            structure: data.structure!,
          },
        });
      } else if (data.role === "PHARMACIEN") {
        await tx.pharmacien.create({
          data: {
            userId: newUser.id,
            numAutorisation: data.numAutorisation!,
            nomOfficine: data.nomOfficine!,
            adresseOfficine: data.adresseOfficine!,
            telephoneOfficine: data.telephoneOfficine || null,
            whatsapp: data.whatsapp || null,
          },
        });
      }

      return newUser;
    });

    // Si patient (auto-validé), créer la session immédiatement
    if (statutCompte === "VALIDE") {
      const token = await signJWT({
        sub: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        statutCompte: user.statutCompte,
      });
      await setSessionCookie(token);
    }

    // Audit (RG-08)
    const ip = req.headers.get("x-forwarded-for") || undefined;
    await logAudit(user.id, "REGISTER", "User", user.id, { role: data.role }, ip);

    return NextResponse.json({
      success: true,
      statutCompte,
      message:
        statutCompte === "EN_ATTENTE"
          ? "Votre compte professionnel a été créé. Il sera activé après validation par un administrateur."
          : "Votre compte a été créé avec succès.",
    });
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur lors de l'inscription" }, { status: 500 });
  }
}
