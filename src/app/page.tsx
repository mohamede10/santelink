//santelink\src\app\page.tsx
import Link from "next/link";
import {
  Heart,
  Shield,
  QrCode,
  Pill,
  BarChart3,
  ArrowRight,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Heart,
    title: "Dossier Patient Unifié",
    description:
      "Centralisez l'historique médical complet : antécédents, consultations, diagnostics et traitements en un seul endroit sécurisé.",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: QrCode,
    title: "Ordonnances QR Code",
    description:
      "Chaque prescription génère un code QR unique et infalsifiable. Le pharmacien scanne et vérifie instantanément le statut.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Pill,
    title: "Recherche Officinale",
    description:
      "Trouvez les pharmacies qui disposent de vos médicaments et contactez-les directement via WhatsApp.",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: Shield,
    title: "Sécurité & Traçabilité",
    description:
      "Chiffrement des données, contrôle d'accès par rôle (RBAC) et journal d'audit infalsifiable sur chaque action.",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "Tableaux de Bord",
    description:
      "Statistiques agrégées pour le suivi épidémiologique et logistique, dans le respect de la confidentialité.",
    color: "text-purple-500 bg-purple-50",
  },
  {
    icon: Users,
    title: "Gestion des Mineurs",
    description:
      "Rattachement obligatoire des patients mineurs (0-17 ans) à un représentant légal vérifié.",
    color: "text-teal-500 bg-teal-50",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">
              Santé<span className="text-emerald-600">Link</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                S&apos;inscrire
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 mb-6">
            🇬🇳 Conçu pour le système de santé guinéen
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            La coordination des soins,
            <br />
            <span className="text-emerald-600">simplifiée et sécurisée</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
            SantéLink connecte patients, médecins et pharmaciens autour d&apos;un
            dossier patient unifié. Prescriptions sécurisées par QR code,
            recherche de médicaments en temps réel et pilotage sanitaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-base px-8">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#fonctionnalites">
              <Button variant="outline" size="lg" className="text-base px-8">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Une plateforme complète pour la santé
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              SantéLink structure l&apos;écosystème de santé à travers des modules
              interconnectés, conçus pour les réalités du terrain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rôles Section ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Pour chaque acteur du parcours de soins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Patient",
                emoji: "🏥",
                desc: "Accédez à votre dossier médical, suivez vos rendez-vous et trouvez vos médicaments.",
              },
              {
                role: "Médecin",
                emoji: "👨‍⚕️",
                desc: "Consultez l'historique patient, rédigez des ordonnances sécurisées par QR code.",
              },
              {
                role: "Pharmacien",
                emoji: "💊",
                desc: "Gérez vos stocks, scannez les ordonnances et enregistrez les délivrances.",
              },
              {
                role: "Administrateur",
                emoji: "⚙️",
                desc: "Validez les professionnels, configurez la plateforme et consultez les indicateurs.",
              },
            ].map((item) => (
              <Card key={item.role} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.role}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-emerald-500" />
              <span className="text-white font-semibold">
                Santé<span className="text-emerald-500">Link</span>
              </span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} SantéLink — Coordination des soins en Guinée GN
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
