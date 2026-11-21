"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Package, Plus, Search, AlertTriangle, CheckCircle2, Edit2 } from "lucide-react";

interface StockItem {
  id: string;
  quantite: number;
  prixUnitaire: number | null;
  seuilAlerte: number;
  medicament: {
    id: string;
    nomDci: string;
    nomCommercial: string | null;
    forme: string;
    dosage: string;
  };
}

interface MedicamentOption {
  id: string;
  nomDci: string;
  forme: string;
  dosage: string;
}

export default function PharmacienStockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [catalogue, setCatalogue] = useState<MedicamentOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulaire d'ajout
  const [selectedMedId, setSelectedMedId] = useState("");
  const [quantite, setQuantite] = useState<number>(50);
  const [prix, setPrix] = useState<number>(15000);
  const [seuil, setSeuil] = useState<number>(10);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadStocks() {
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacien/stock");
      const data = await res.json();
      if (res.ok) setStocks(data.stocks || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStocks();
    fetch("/api/medicaments")
      .then((r) => r.json())
      .then((d) => setCatalogue(d.medicaments || []));
  }, []);

  async function handleAddOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setMsg(null);

    try {
      const res = await fetch("/api/pharmacien/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicamentId: selectedMedId,
          quantite: Number(quantite),
          prixUnitaire: Number(prix),
          seuilAlerte: Number(seuil),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "Stock mis à jour avec succès !", type: "success" });
        setShowAddForm(false);
        loadStocks();
      } else {
        setMsg({ text: data.error || "Erreur de mise à jour", type: "error" });
      }
    } finally {
      setAdding(false);
    }
  }

  const filteredStocks = stocks.filter(
    (s) =>
      s.medicament.nomDci.toLowerCase().includes(search.toLowerCase()) ||
      (s.medicament.nomCommercial && s.medicament.nomCommercial.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-emerald-600" />
            Gestion des Stocks de l&apos;Officine
          </h1>
          <p className="text-gray-500 mt-1">
            Mettez à jour les stocks en temps réel pour alimenter le moteur de recherche patient
          </p>
        </div>

        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4" />
          {showAddForm ? "Fermer le formulaire" : "Ajouter un médicament"}
        </Button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {msg.text}
        </div>
      )}

      {/* Formulaire d'ajout / réapprovisionnement */}
      {showAddForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Ajouter ou Mettre à Jour un Stock</CardTitle>
            <CardDescription>Sélectionnez un médicament de la nomenclature guinéenne</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label>Médicament (DCI)</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    required
                  >
                    <option value="">-- Choisir dans le catalogue --</option>
                    {catalogue.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nomDci} ({m.dosage} - {m.forme})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantité en stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quantite}
                    onChange={(e) => setQuantite(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label>Prix unitaire (GNF)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={prix}
                    onChange={(e) => setPrix(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="w-48">
                  <Label>Seuil d&apos;alerte rupture</Label>
                  <Input
                    type="number"
                    min={1}
                    value={seuil}
                    onChange={(e) => setSeuil(Number(e.target.value))}
                    required
                  />
                </div>
                <Button type="submit" isLoading={adding}>
                  Enregistrer dans le stock
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tableau de stock */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Inventaire Officinal ({filteredStocks.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filtrer un médicament..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Chargement des stocks...</div>
          ) : filteredStocks.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Aucun médicament répertorié</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-left">
                    <th className="py-3">DCI</th>
                    <th className="py-3">Forme & Dosage</th>
                    <th className="py-3 text-right">Prix Unitaire</th>
                    <th className="py-3 text-center">Quantité</th>
                    <th className="py-3 text-center">Statut</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((item) => {
                    const isLow = item.quantite <= item.seuilAlerte;
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-semibold text-gray-900">
                          {item.medicament.nomDci}
                          {item.medicament.nomCommercial && (
                            <span className="text-xs text-gray-500 font-normal ml-2">
                              ({item.medicament.nomCommercial})
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-600">
                          {item.medicament.dosage} — {item.medicament.forme}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          {item.prixUnitaire ? `${item.prixUnitaire.toLocaleString("fr-FR")} GNF` : "-"}
                        </td>
                        <td className="py-3 text-center font-bold text-gray-900">
                          {item.quantite}
                        </td>
                        <td className="py-3 text-center">
                          {isLow ? (
                            <Badge variant="danger" className="inline-flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Stock faible (≤ {item.seuilAlerte})
                            </Badge>
                          ) : (
                            <Badge variant="success">Normal</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMedId(item.medicament.id);
                              setQuantite(item.quantite);
                              setPrix(item.prixUnitaire || 15000);
                              setSeuil(item.seuilAlerte);
                              setShowAddForm(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                            Modifier
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
