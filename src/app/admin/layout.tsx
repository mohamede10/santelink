import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <DashboardShell role="ADMIN" userName={`${session.prenom} ${session.nom}`}>
      {children}
    </DashboardShell>
  );
}
