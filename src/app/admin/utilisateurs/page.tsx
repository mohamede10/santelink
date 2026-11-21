import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Stethoscope, Pill, Activity } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUtilisateursPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { numDossier: true } },
      medecin: { select: { numOrdre: true, structure: true, specialite: true } },
      pharmacien: { select: { nomOfficine: true, numAutorisation: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-7 w-7 text-emerald-600" />
          Répertoire Global des Utilisateurs
        </h1>
        <p className="text-gray-500 mt-1">
          Gestion des comptes, des rôles et des habilitations de la plateforme ({users.length} comptes)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comptes enregistrés</CardTitle>
          <CardDescription>Vue d&apos;ensemble de tous les acteurs inscrits sur SantéLink</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="py-3">Utilisateur</th>
                  <th className="py-3">Rôle</th>
                  <th className="py-3">Détails professionnels</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-right">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          u.role === "ADMIN" ? "info" :
                          u.role === "MEDECIN" ? "default" :
                          u.role === "PHARMACIEN" ? "warning" : "success"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-gray-600">
                      {u.patient && <span>Dossier: {u.patient.numDossier}</span>}
                      {u.medecin && (
                        <span>
                          {u.medecin.specialite} — {u.medecin.structure} ({u.medecin.numOrdre})
                        </span>
                      )}
                      {u.pharmacien && (
                        <span>
                          {u.pharmacien.nomOfficine} (Aut. {u.pharmacien.numAutorisation})
                        </span>
                      )}
                      {!u.patient && !u.medecin && !u.pharmacien && <span>Administrateur système</span>}
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={
                          u.statutCompte === "VALIDE" ? "success" :
                          u.statutCompte === "EN_ATTENTE" ? "warning" : "danger"
                        }
                      >
                        {u.statutCompte}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
