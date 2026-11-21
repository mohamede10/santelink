import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function PharmacienLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "PHARMACIEN") {
    redirect("/auth/login");
  }

  return (
    <DashboardShell
      role="PHARMACIEN"
      userName={`${session.prenom} ${session.nom}`}
      subtitle={session.nomOfficine || undefined}
    >
      {children}
    </DashboardShell>
  );
}
