import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT, setSessionCookie, logAudit } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        patient: { select: { id: true, numDossier: true } },
        medecin: { select: { id: true, structure: true, specialite: true } },
        pharmacien: { select: { id: true, nomOfficine: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants incorrects (email ou mot de passe)" },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Identifiants incorrects (email ou mot de passe)" },
        { status: 401 }
      );
    }

    // RG-02: Vérification stricte du statut du compte
    if (user.statutCompte !== "VALIDE") {
      let message = "Votre compte n'est pas actif.";
      if (user.statutCompte === "EN_ATTENTE") {
        message = "Votre compte professionnel est en attente de validation par l'administrateur (RG-01/02).";
      } else if (user.statutCompte === "SUSPENDU") {
        message = "Votre compte a été suspendu par l'administrateur (RG-03). Contactez le support.";
      } else if (user.statutCompte === "REJETE") {
        message = "Votre demande d'inscription a été rejetée.";
      }
      return NextResponse.json({ error: message, statutCompte: user.statutCompte }, { status: 403 });
    }

    // Générer JWT
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      statutCompte: user.statutCompte,
    });

    // Enregistrer le cookie HTTP-Only
    await setSessionCookie(token);

    // Mettre à jour lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Journal d'audit (RG-08)
    const ip = req.headers.get("x-forwarded-for") || undefined;
    await logAudit(user.id, "LOGIN", "User", user.id, { email: user.email }, ip);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        statutCompte: user.statutCompte,
        patientId: user.patient?.id || null,
        medecinId: user.medecin?.id || null,
        pharmacienId: user.pharmacien?.id || null,
        numDossier: user.patient?.numDossier || null,
        nomOfficine: user.pharmacien?.nomOfficine || null,
        structure: user.medecin?.structure || null,
      },
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Erreur serveur lors de la connexion" }, { status: 500 });
  }
}
