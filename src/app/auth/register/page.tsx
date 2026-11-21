"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

type RoleType = "PATIENT" | "MEDECIN" | "PHARMACIEN";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleType>("PATIENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    telephone: "",
    // Patient
    dateNaissance: "",
    sexe: "M",
    adresse: "",
    // Médecin
    numOrdre: "",
    specialite: "",
    structure: "",
    // Pharmacien
    numAutorisation: "",
    nomOfficine: "",
    adresseOfficine: "",
    telephoneOfficine: "",
    whatsapp: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      if (data.statutCompte === "EN_ATTENTE") {
        router.push("/auth/en-attente");
      } else {
        router.push("/patient");
        router.refresh();
      }
    } catch {
      setError("Erreur de connexion au serveur");
      setIsLoading(false);
    }
  }

  const roleButtons: { value: RoleType; emoji: string; label: string }[] = [
    { value: "PATIENT", emoji: "🏥", label: "Patient" },
    { value: "MEDECIN", emoji: "👨‍⚕️", label: "Médecin" },
    { value: "PHARMACIEN", emoji: "💊", label: "Pharmacien" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">
              Santé<span className="text-emerald-600">Link</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              Choisissez votre profil et remplissez vos informations
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
                  {error}
                </div>
              )}

              {/* Sélecteur de rôle */}
              <div>
                <Label>Vous êtes</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {roleButtons.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        role === r.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
                {role !== "PATIENT" && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                    ⚠️ Les comptes professionnels nécessitent une validation par l&apos;administrateur (RG-01/02).
                  </p>
                )}
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" value={form.prenom} onChange={(e) => updateForm("prenom", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" value={form.nom} onChange={(e) => updateForm("nom", e.target.value)} required />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" type="tel" placeholder="+224 6XX XX XX XX" value={form.telephone} onChange={(e) => updateForm("telephone", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    minLength={8}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* ── Champs Patient ── */}
              {role === "PATIENT" && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700">Informations patient</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dateNaissance">Date de naissance</Label>
                      <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={(e) => updateForm("dateNaissance", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="sexe">Sexe</Label>
                      <select id="sexe" value={form.sexe} onChange={(e) => updateForm("sexe", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input id="adresse" placeholder="Quartier, Commune, Ville" value={form.adresse} onChange={(e) => updateForm("adresse", e.target.value)} />
                  </div>
                </div>
              )}

              {/* ── Champs Médecin ── */}
              {role === "MEDECIN" && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700">Informations professionnelles</h4>
                  <div>
                    <Label htmlFor="numOrdre">Numéro d&apos;ordre</Label>
                    <Input id="numOrdre" placeholder="N° Ordre des Médecins" value={form.numOrdre} onChange={(e) => updateForm("numOrdre", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="specialite">Spécialité</Label>
                    <select id="specialite" value={form.specialite} onChange={(e) => updateForm("specialite", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                      <option value="">Sélectionner...</option>
                      <option value="Médecine générale">Médecine générale</option>
                      <option value="Pédiatrie">Pédiatrie</option>
                      <option value="Gynécologie">Gynécologie</option>
                      <option value="Cardiologie">Cardiologie</option>
                      <option value="Chirurgie">Chirurgie</option>
                      <option value="Dermatologie">Dermatologie</option>
                      <option value="Ophtalmologie">Ophtalmologie</option>
                      <option value="ORL">ORL</option>
                      <option value="Radiologie">Radiologie</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="structure">Structure de santé</Label>
                    <Input id="structure" placeholder="Hôpital / Clinique / Cabinet" value={form.structure} onChange={(e) => updateForm("structure", e.target.value)} required />
                  </div>
                </div>
              )}

              {/* ── Champs Pharmacien ── */}
              {role === "PHARMACIEN" && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700">Informations officine</h4>
                  <div>
                    <Label htmlFor="numAutorisation">Numéro d&apos;autorisation</Label>
                    <Input id="numAutorisation" placeholder="N° d'autorisation d'exercice" value={form.numAutorisation} onChange={(e) => updateForm("numAutorisation", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="nomOfficine">Nom de l&apos;officine</Label>
                    <Input id="nomOfficine" placeholder="Pharmacie..." value={form.nomOfficine} onChange={(e) => updateForm("nomOfficine", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="adresseOfficine">Adresse de l&apos;officine</Label>
                    <Input id="adresseOfficine" placeholder="Quartier, Commune, Ville" value={form.adresseOfficine} onChange={(e) => updateForm("adresseOfficine", e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="telephoneOfficine">Tél. officine</Label>
                      <Input id="telephoneOfficine" type="tel" value={form.telephoneOfficine} onChange={(e) => updateForm("telephoneOfficine", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input id="whatsapp" type="tel" placeholder="+224..." value={form.whatsapp} onChange={(e) => updateForm("whatsapp", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Créer mon compte
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
