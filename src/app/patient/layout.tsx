import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/auth/login");
  }

  return (
    <DashboardShell
      role="PATIENT"
      userName={`${session.prenom} ${session.nom}`}
      subtitle={session.numDossier || undefined}
    >
      {children}
    </DashboardShell>
  );
}
