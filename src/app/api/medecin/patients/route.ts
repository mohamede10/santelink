import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "MEDECIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { numDossier: { contains: q, mode: "insensitive" } },
            { user: { nom: { contains: q, mode: "insensitive" } } },
            { user: { prenom: { contains: q, mode: "insensitive" } } },
            { user: { telephone: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
      allergies: true,
      antecedents: true,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients });
}
