"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, QrCode, AlertCircle, FileText, Calendar, Phone } from "lucide-react";

interface PatientItem {
  id: string;
  numDossier: string;
  dateNaissance: string;
  sexe: string;
  groupeSanguin: string | null;
  adresse: string | null;
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
  };
  allergies?: { substance: string; severite: string | null }[];
  antecedents?: { type: string; description: string }[];
}

export default function MedecinPatientsPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPatients(query = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/medecin/patients?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) setPatients(data.patients || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPatients(search);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-emerald-600" />
            Dossiers Patients
          </h1>
          <p className="text-gray-500 mt-1">
            Consultation de l&apos;historique médical et antécédents des patients enregistrés
          </p>
        </div>

        <Link href="/medecin/ordonnances">
          <Button>
            <QrCode className="h-4 w-4" />
            Nouvelle ordonnance
          </Button>
        </Link>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, prénom, N° dossier (ex: PAT-2024-00001) ou téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des patients */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Chargement des dossiers patients...</div>
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">Aucun patient trouvé</p>
            </CardContent>
          </Card>
        ) : (
          patients.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-lg">
                        {p.user.prenom} {p.user.nom}
                      </span>
                      <Badge variant="info" className="font-mono text-xs">
                        {p.numDossier}
                      </Badge>
                      {p.groupeSanguin && <Badge variant="outline">{p.groupeSanguin}</Badge>}
                      <Badge variant="outline">{p.sexe === "M" ? "Masculin" : "Féminin"}</Badge>
                    </div>

                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
                      <span><strong>Né(e) le:</strong> {new Date(p.dateNaissance).toLocaleDateString("fr-FR")}</span>
                      {p.user.telephone && <span><strong>Tél:</strong> {p.user.telephone}</span>}
                      {p.adresse && <span><strong>Adresse:</strong> {p.adresse}</span>}
                    </div>

                    {/* Allergies */}
                    {p.allergies && p.allergies.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>
                          <strong>Allergies:</strong> {p.allergies.map((a) => a.substance).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/medecin/ordonnances">
                      <Button size="sm">
                        <QrCode className="h-4 w-4" />
                        Prescrire
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
