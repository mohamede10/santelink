"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, MessageSquare, Pill, AlertCircle, Building2 } from "lucide-react";

interface SearchResult {
  medicament: {
    id: string;
    nomDci: string;
    nomCommercial: string | null;
    forme: string;
    dosage: string;
  };
  pharmacie: {
    id: string;
    nomOfficine: string;
    adresse: string;
    telephone: string | null;
    whatsappLink: string | null;
  };
  quantite: number;
  prixUnitaire: number | null;
}

export default function PatientRecherchePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (query.trim().length < 2) {
      setError("Entrez au moins 2 lettres pour chercher");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/patient/recherche?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || "Erreur de recherche");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Pill className="h-7 w-7 text-emerald-600" />
          Recherche Officinale de Médicaments
        </h1>
        <p className="text-gray-500 mt-1">
          Vérifiez la disponibilité déclarée des médicaments et contactez directement l&apos;officine via WhatsApp (Module 5)
        </p>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tapez un nom de médicament (ex: Paracétamol, Amoxicilline, Coartem...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" isLoading={loading} className="shrink-0 h-12 px-6">
              <Search className="h-4 w-4" />
              Rechercher en Guinée
            </Button>
          </form>

          {/* Suggestions rapides */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Recherches fréquentes:</span>
            {["Paracétamol", "Amoxicilline", "Artéméther", "Ibuprofène", "Oméprazole"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setTimeout(() => handleSearch(), 50);
                }}
                className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {/* Résultats */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Résultats disponibles ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Aucune officine n&apos;a déclaré ce stock actuellement</p>
                <p className="text-sm text-gray-400 mt-1">
                  Essayez avec un autre nom de molécule (DCI) ou contactez votre médecin.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base text-gray-900">
                          {r.medicament.nomDci}
                          {r.medicament.nomCommercial && (
                            <span className="text-xs text-emerald-600 font-normal ml-2">
                              ({r.medicament.nomCommercial})
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {r.medicament.dosage} — {r.medicament.forme}
                        </CardDescription>
                      </div>
                      <Badge variant="success">En stock: {r.quantite}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{r.pharmacie.nomOfficine}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>{r.pharmacie.adresse}</span>
                      </div>
                      {r.pharmacie.telephone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{r.pharmacie.telephone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400">Prix unitaire indicatif:</span>
                        <p className="font-bold text-gray-900 text-sm">
                          {r.prixUnitaire ? `${r.prixUnitaire.toLocaleString("fr-FR")} GNF` : "Non renseigné"}
                        </p>
                      </div>

                      {r.pharmacie.whatsappLink ? (
                        <a
                          href={r.pharmacie.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Contacter WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">WhatsApp non configuré</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
