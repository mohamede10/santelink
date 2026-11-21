import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function MedecinLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "MEDECIN") {
    redirect("/auth/login");
  }

  return (
    <DashboardShell
      role="MEDECIN"
      userName={`Dr. ${session.prenom} ${session.nom}`}
      subtitle={session.structure || undefined}
    >
      {children}
    </DashboardShell>
  );
}
