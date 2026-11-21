"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle2, AlertTriangle, Pill, ShieldCheck, User, Calendar } from "lucide-react";

interface ScannedOrdonnance {
  id: string;
  statut: string;
  dateEmission: string;
  dateExpiration: string;
  patient: { nom: string; prenom: string };
  medecin: { nom: string; prenom: string };
  lignes: {
    id: string;
    medicament: string;
    forme: string;
    dosage: string;
    posologie: string;
    duree: string;
    quantite: number;
    quantiteDelivree: number;
    resteADelivrer: number;
  }[];
}

export default function PharmacienScannerPage() {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [ordonnance, setOrdonnance] = useState<ScannedOrdonnance | null>(null);

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!qrInput.trim()) return;

    setError(null);
    setSuccessMsg(null);
    setOrdonnance(null);
    setLoading(true);

    try {
      const res = await fetch("/api/pharmacien/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: qrInput }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrdonnance(data.ordonnance);
      } else {
        setError(data.error || "Erreur lors de la vérification du QR Code");
      }
    } catch {
      setError("Impossible de joindre le serveur de vérification");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelivrer() {
    if (!ordonnance) return;

    setDelivering(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/pharmacien/delivrer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordonnanceId: ordonnance.id,
          lignes: ordonnance.lignes.map((l) => ({
            ligneOrdonnanceId: l.id,
            quantiteDelivree: l.quantite,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Ordonnance délivrée avec succès ! Le statut a été mis à jour et l'ordonnance est désormais verrouillée (RG-07).");
        setOrdonnance((prev) => (prev ? { ...prev, statut: "DELIVREE" } : null));
      } else {
        setError(data.error || "Erreur lors de la délivrance");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setDelivering(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="h-7 w-7 text-emerald-600" />
          Scanner & Vérification d&apos;Ordonnances
        </h1>
        <p className="text-gray-500 mt-1">
          Vérification cryptographique instantanée et enregistrement de délivrance (RG-06/07)
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entrée du QR Code de l&apos;ordonnance</CardTitle>
          <CardDescription>
            Scannez le code QR présenté par le patient ou collez le payload JSON signé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                placeholder='Ex: {"id":"...","hash":"..."}'
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" isLoading={loading}>
                <ShieldCheck className="h-4 w-4" />
                Vérifier l&apos;authenticité
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {ordonnance && (
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Ordonnance Authentifiée
                </CardTitle>
                <CardDescription>ID: {ordonnance.id}</CardDescription>
              </div>
              <Badge variant={ordonnance.statut === "VALIDE" ? "success" : "default"}>
                {ordonnance.statut}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Infos Patient & Médecin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-semibold text-gray-900">{ordonnance.patient.prenom} {ordonnance.patient.nom}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Prescripteur</p>
                  <p className="font-semibold text-gray-900">Dr. {ordonnance.medecin.prenom} {ordonnance.medecin.nom}</p>
                </div>
              </div>
            </div>

            {/* Liste des médicaments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-emerald-600" />
                Traitements prescrits ({ordonnance.lignes.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-left">
                      <th className="py-2">Médicament</th>
                      <th className="py-2">Posologie</th>
                      <th className="py-2">Durée</th>
                      <th className="py-2 text-right">Qté prescrite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordonnance.lignes.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">
                          {l.medicament} <span className="text-xs text-gray-500">({l.dosage} - {l.forme})</span>
                        </td>
                        <td className="py-3 text-gray-600">{l.posologie}</td>
                        <td className="py-3 text-gray-600">{l.duree}</td>
                        <td className="py-3 text-right font-bold text-gray-900">{l.quantite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions de délivrance */}
            <div className="pt-4 border-t flex items-center justify-between">
              <p className="text-xs text-gray-500">
                La validation décrémente les stocks de votre officine et verrouille l&apos;ordonnance (RG-07).
              </p>
              {ordonnance.statut === "VALIDE" && (
                <Button size="lg" onClick={handleDelivrer} isLoading={delivering}>
                  <CheckCircle2 className="h-5 w-5" />
                  Valider la délivrance complète
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
