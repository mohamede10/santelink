"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Plus, Trash2, CheckCircle2, AlertCircle, FileText, Search, Printer } from "lucide-react";

interface PatientOption {
  id: string;
  numDossier: string;
  user: { nom: string; prenom: string };
  allergies?: { substance: string }[];
}

interface MedicamentOption {
  id: string;
  nomDci: string;
  forme: string;
  dosage: string;
}

interface LigneForm {
  medicamentId: string;
  posologie: string;
  duree: string;
  quantite: number;
  instructions: string;
}

export default function MedecinOrdonnancesPage() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [medicaments, setMedicaments] = useState<MedicamentOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [motif, setMotif] = useState("Consultation de routine");
  const [diagnostic, setDiagnostic] = useState("");
  const [dateExpiration, setDateExpiration] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [lignes, setLignes] = useState<LigneForm[]>([
    { medicamentId: "", posologie: "1 comprimé matin et soir", duree: "7 jours", quantite: 14, instructions: "Au cours des repas" },
  ]);

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    ordonnance: { id: string; qrCodeHash: string };
    qrCode: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load patients and medicines
    fetch("/api/medecin/patients")
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []));

    fetch("/api/medicaments")
      .then((r) => r.json())
      .then((d) => setMedicaments(d.medicaments || []));
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  function addLigne() {
    setLignes((prev) => [
      ...prev,
      { medicamentId: "", posologie: "", duree: "", quantite: 1, instructions: "" },
    ]);
  }

  function removeLigne(index: number) {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLigne(index: number, field: keyof LigneForm, val: string | number) {
    setLignes((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: val } : l))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessData(null);

    if (!selectedPatientId) {
      setError("Veuillez sélectionner un patient");
      return;
    }

    if (lignes.some((l) => !l.medicamentId || !l.posologie || !l.duree)) {
      setError("Veuillez remplir tous les champs des médicaments prescrits");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/medecin/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          motif,
          diagnostic,
          ordonnance: {
            dateExpiration,
            lignes: lignes.map((l) => ({
              ...l,
              quantite: Number(l.quantite),
            })),
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessData({
          ordonnance: data.ordonnance,
          qrCode: data.qrCode,
        });
      } else {
        setError(data.error || "Erreur lors de la création");
      }
    } catch {
      setError("Erreur de communication avec le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="h-7 w-7 text-emerald-600" />
          Nouvelle Prescription Sécurisée
        </h1>
        <p className="text-gray-500 mt-1">
          Émission d&apos;ordonnance infalsifiable avec QR Code cryptographique unique (RG-06)
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {successData && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm shrink-0">
                {/* QR Code image generated on server */}
                <Image
                  src={successData.qrCode}
                  alt="QR Code Ordonnance"
                  width={180}
                  height={180}
                  className="rounded-lg"
                  unoptimized
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <span className="font-bold text-lg text-emerald-900">
                    Ordonnance générée et signée cryptographiquement !
                  </span>
                </div>
                <p className="text-sm text-emerald-800">
                  <strong>ID Ordonnance:</strong> {successData.ordonnance.id}
                </p>
                <p className="text-xs text-emerald-700 font-mono break-all">
                  <strong>Hash SHA-256:</strong> {successData.ordonnance.qrCodeHash}
                </p>
                <p className="text-xs text-emerald-800 mt-2">
                  Le patient peut désormais présenter ce QR code dans n&apos;importe quelle officine de Guinée pour une délivrance sécurisée.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                    Imprimer l&apos;ordonnance
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Choix du patient */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Sélection du Patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientSelect">Patient</Label>
              <select
                id="patientSelect"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                <option value="">-- Sélectionner un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user.prenom} {p.user.nom} ({p.numDossier})
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>
                  <strong>Allergies signalées (Module IA Contextuel) :</strong>{" "}
                  {selectedPatient.allergies.map((a) => a.substance).join(", ")}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motif">Motif de consultation</Label>
                <Input
                  id="motif"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex: Fièvre, toux..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnostic">Diagnostic / Hypothèse</Label>
                <Input
                  id="diagnostic"
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value)}
                  placeholder="Ex: Paludisme simple"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes de prescription */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">2. Médicaments Prescrits</CardTitle>
              <CardDescription>Spécifiez la posologie, durée et quantité pour chaque ligne</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLigne}>
              <Plus className="h-4 w-4" />
              Ajouter un médicament
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lignes.map((ligne, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Médicament #{idx + 1}</span>
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLigne(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Label>Médicament (DCI)</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                      value={ligne.medicamentId}
                      onChange={(e) => updateLigne(idx, "medicamentId", e.target.value)}
                      required
                    >
                      <option value="">Sélectionner dans le catalogue...</option>
                      {medicaments.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nomDci} ({m.dosage} - {m.forme})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Posologie</Label>
                    <Input
                      value={ligne.posologie}
                      onChange={(e) => updateLigne(idx, "posologie", e.target.value)}
                      placeholder="Ex: 1 comp matin et soir"
                      required
                    />
                  </div>
                  <div>
                    <Label>Durée</Label>
                    <Input
                      value={ligne.duree}
                      onChange={(e) => updateLigne(idx, "duree", e.target.value)}
                      placeholder="Ex: 5 jours"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Quantité totale</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ligne.quantite}
                      onChange={(e) => updateLigne(idx, "quantite", Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Instructions particulières</Label>
                    <Input
                      value={ligne.instructions}
                      onChange={(e) => updateLigne(idx, "instructions", e.target.value)}
                      placeholder="Ex: À prendre avec un grand verre d'eau"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Label htmlFor="dateExpiration">Date d&apos;expiration de l&apos;ordonnance</Label>
              <Input
                id="dateExpiration"
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" size="lg" isLoading={loading}>
            <QrCode className="h-5 w-5" />
            Générer l&apos;Ordonnance Sécurisée & QR Code
          </Button>
        </div>
      </form>
    </div>
  );
}
