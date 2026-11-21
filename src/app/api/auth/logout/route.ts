import { NextResponse } from "next/server";
import { clearSessionCookie, getSession, logAudit } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();
    if (session) {
      await logAudit(session.id, "LOGOUT", "User", session.id);
    }
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
