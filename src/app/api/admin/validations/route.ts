export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, logAudit } from "@/lib/auth";

// GET: Liste des comptes en attente
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const pendingUsers = await prisma.user.findMany({
    where: { statutCompte: "EN_ATTENTE" },
    orderBy: { createdAt: "desc" },
    include: {
      medecin: { select: { numOrdre: true, specialite: true, structure: true } },
      pharmacien: { select: { numAutorisation: true, nomOfficine: true, adresseOfficine: true } },
    },
  });

  return NextResponse.json({ users: pendingUsers });
}

// PATCH: Valider ou rejeter un compte (RG-01/02/03)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { userId, action } = await req.json();

  if (!userId || !["VALIDE", "REJETE", "SUSPENDU"].includes(action)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      statutCompte: action,
      valideParId: session.id,
    },
  });

  // Audit (RG-08)
  await logAudit(session.id, `ACCOUNT_${action}`, "User", userId, {
    targetEmail: targetUser.email,
    targetRole: targetUser.role,
  });

  // Notification à l'utilisateur
  await prisma.notification.create({
    data: {
      userId,
      titre: action === "VALIDE" ? "Compte activé" : action === "REJETE" ? "Compte rejeté" : "Compte suspendu",
      message:
        action === "VALIDE"
          ? "Votre compte professionnel a été validé par l'administrateur. Vous pouvez maintenant vous connecter."
          : action === "REJETE"
          ? "Votre demande d'inscription a été rejetée par l'administrateur."
          : "Votre compte a été suspendu par l'administrateur.",
      type: action === "VALIDE" ? "SUCCESS" : "WARNING",
    },
  });

  return NextResponse.json({ success: true, action });
}
