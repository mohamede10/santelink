import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "santelink_super_secure_jwt_secret_key_gn_2025_32chars"
);

const COOKIE_NAME = "santelink_session";

// Configuration des accès par rôle
const ROLE_ROUTES: Record<string, string> = {
  "/admin": "ADMIN",
  "/medecin": "MEDECIN",
  "/pharmacien": "PHARMACIEN",
  "/patient": "PATIENT",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Autoriser les fichiers statiques et assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let userPayload: { sub: string; role: string; statutCompte: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      userPayload = payload as unknown as { sub: string; role: string; statutCompte: string };
    } catch {
      userPayload = null;
    }
  }

  // Rediriger les utilisateurs déjà connectés accédant à /auth/login ou /auth/register
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (userPayload && userPayload.statutCompte === "VALIDE") {
      const dashboardUrl = getDashboardForRole(userPayload.role);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // Vérifier les routes protégées
  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!userPayload) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (userPayload.statutCompte !== "VALIDE") {
        return NextResponse.redirect(new URL("/auth/en-attente", request.url));
      }

      if (userPayload.role !== requiredRole && userPayload.role !== "ADMIN") {
        // Rediriger vers son propre tableau de bord si le rôle ne correspond pas
        const correctDashboard = getDashboardForRole(userPayload.role);
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MEDECIN":
      return "/medecin";
    case "PHARMACIEN":
      return "/pharmacien";
    case "PATIENT":
      return "/patient";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/medecin/:path*",
    "/pharmacien/:path*",
    "/patient/:path*",
    "/auth/:path*",
  ],
};
