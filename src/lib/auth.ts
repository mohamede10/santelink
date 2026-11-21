import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, SessionUser, JWTPayload } from "./types";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "santelink_super_secure_jwt_secret_key_gn_2025_32chars"
);

export const COOKIE_NAME = "santelink_session";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// ── JWT Utilities ──

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ── Password Hashing ──

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Server Session Helpers ──

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload || !payload.sub) return null;

    // Fetch user with role details
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        patient: { select: { id: true, numDossier: true } },
        medecin: { select: { id: true, structure: true, specialite: true } },
        pharmacien: { select: { id: true, nomOfficine: true } },
      },
    });

    if (!user || user.statutCompte !== "VALIDE") {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role as Role,
      statutCompte: user.statutCompte,
      photoUrl: user.photoUrl,
      patientId: user.patient?.id || null,
      medecinId: user.medecin?.id || null,
      pharmacienId: user.pharmacien?.id || null,
      numDossier: user.patient?.numDossier || null,
      nomOfficine: user.pharmacien?.nomOfficine || null,
      structure: user.medecin?.structure || null,
    };
  } catch {
    return null;
  }
}

// ── Session Cookie Management ──

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Audit Logging Helper (RG-08) ──

export async function logAudit(
  userId: string,
  action: string,
  entite?: string,
  entiteId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entite: entite || null,
        entiteId: entiteId || null,
        details: (details as object) || undefined,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
