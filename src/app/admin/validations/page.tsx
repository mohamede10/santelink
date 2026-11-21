"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, UserCheck, Stethoscope, Pill, AlertCircle } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: "MEDECIN" | "PHARMACIEN";
  createdAt: string;
  medecin?: {
    numOrdre: string;
    specialite: string;
    structure: string;
  } | null;
  pharmacien?: {
    numAutorisation: string;
    nomOfficine: string;
    adresseOfficine: string;
  } | null;
}

export default function AdminValidationsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadPending() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/validations");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch {
      setMessage({ text: "Erreur lors du chargement des demandes", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleAction(userId: string, action: "VALIDE" | "REJETE") {
    setActionLoading(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/validations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: action === "VALIDE" ? "Compte professionnel validé avec succès." : "Compte rejeté.",
          type: "success",
        });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setMessage({ text: data.error || "Erreur lors du traitement", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur réseau", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCheck className="h-7 w-7 text-emerald-600" />
          Habilitation & Validation des Professionnels
        </h1>
        <p className="text-gray-500 mt-1">
          Règles de gestion RG-01 à RG-03 : validation préalable obligatoire des médecins et pharmaciens
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Demandes en attente ({users.length})</CardTitle>
          <CardDescription>
            Vérifiez l&apos;authenticité des numéros d&apos;ordre et d&apos;autorisation avant d&apos;activer un compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Chargement des demandes...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Aucun compte en attente de validation</p>
              <p className="text-gray-400 text-sm mt-1">Tous les professionnels inscrits ont été traités.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-base">
                        {u.prenom} {u.nom}
                      </span>
                      <Badge variant={u.role === "MEDECIN" ? "info" : "warning"}>
                        {u.role === "MEDECIN" ? "Médecin" : "Pharmacien"}
                      </Badge>
                      <Badge variant="outline">En attente</Badge>
                    </div>

                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-1">
                      <span><strong>Email:</strong> {u.email}</span>
                      {u.telephone && <span><strong>Tél:</strong> {u.telephone}</span>}
                      <span><strong>Date inscription:</strong> {new Date(u.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>

                    {u.role === "MEDECIN" && u.medecin && (
                      <div className="p-3 bg-blue-50/50 rounded-lg text-sm text-blue-900 flex items-center gap-3">
                        <Stethoscope className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <p><strong>N° Ordre:</strong> {u.medecin.numOrdre} — <strong>Spécialité:</strong> {u.medecin.specialite}</p>
                          <p><strong>Structure:</strong> {u.medecin.structure}</p>
                        </div>
                      </div>
                    )}

                    {u.role === "PHARMACIEN" && u.pharmacien && (
                      <div className="p-3 bg-amber-50/50 rounded-lg text-sm text-amber-900 flex items-center gap-3">
                        <Pill className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <p><strong>Officine:</strong> {u.pharmacien.nomOfficine} — <strong>N° Autorisation:</strong> {u.pharmacien.numAutorisation}</p>
                          <p><strong>Adresse:</strong> {u.pharmacien.adresseOfficine}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAction(u.id, "VALIDE")}
                      isLoading={actionLoading === u.id}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Valider le compte
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(u.id, "REJETE")}
                      isLoading={actionLoading === u.id}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
