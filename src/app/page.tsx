"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Pill,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "En action", href: "#en-action" },
  { label: "Parcours", href: "#parcours" },
  { label: "Profils", href: "#profils" },
  { label: "FAQ", href: "#faq" },
];

type Slide = {
  image: string;
  alt: string;
  badge: string;
  title: string;
  description: string;
  overlay: string;
};

const slides: Slide[] = [
  {
    image: "/images/carrousel-dossier-patient.svg",
    alt: "Illustration d’un dossier patient unifié sur tablette",
    badge: "Dossier patient unifié",
    title: "L’historique médical suit le patient, pas l’inverse.",
    description:
      "Antécédents, consultations, diagnostics et traitements sont centralisés et consultables selon les droits de chaque acteur.",
    overlay: "from-emerald-950/95 via-emerald-900/75 to-emerald-800/20",
  },
  {
    image: "/images/carrousel-ordonnance-qr.svg",
    alt: "Illustration d’un pharmacien vérifiant une ordonnance par QR code",
    badge: "Ordonnances sécurisées",
    title: "Un QR code unique, vérifié en quelques secondes.",
    description:
      "Le pharmacien scanne la prescription, connaît son statut — valide, délivrée ou expirée — et enregistre la délivrance.",
    overlay: "from-teal-950/95 via-teal-900/75 to-sky-800/20",
  },
  {
    image: "/images/carrousel-stock-pharmacie.svg",
    alt: "Illustration d’un pharmacien gérant les stocks de médicaments",
    badge: "Stocks officinaux",
    title: "Le bon médicament, dans la bonne officine.",
    description:
      "Les stocks déclarés sont mis à jour par les pharmaciens. Les patients trouvent une disponibilité et contactent l’officine via WhatsApp.",
    overlay: "from-slate-950/95 via-slate-900/75 to-emerald-800/20",
  },
];

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: string;
};

const features: Feature[] = [
  {
    icon: HeartPulse,
    title: "Dossier patient unifié",
    description:
      "Un identifiant unique par patient, avec rattachement obligatoire des mineurs à un représentant légal vérifié.",
    tone: "bg-rose-50 text-rose-600 ring-rose-100",
  },
  {
    icon: QrCode,
    title: "Ordonnances infalsifiables",
    description:
      "Chaque prescription reçoit un QR code sécurisé et un identifiant unique. Verrouillage automatique après délivrance totale ou expiration.",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icon: Search,
    title: "Recherche officinale",
    description:
      "Recherchez un médicament, voyez les officines partenaires qui le déclarent disponible et ouvrez WhatsApp avec un message prêt à envoyer.",
    tone: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icon: Lock,
    title: "Sécurité & traçabilité",
    description:
      "Mots de passe hachés, accès par rôle étanche et journal d’audit infalsifiable sur chaque consultation ou modification sensible.",
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  {
    icon: BarChart3,
    title: "Pilotage sanitaire",
    description:
      "Des tableaux de bord agrégés pour suivre l’activité, les stocks et les tendances, sans exposer les données personnelles.",
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le terrain",
    description:
      "Interface mobile-first, adaptée à une connectivité variable et installable comme application web progressive (PWA).",
    tone: "bg-teal-50 text-teal-600 ring-teal-100",
  },
];

const steps = [
  {
    icon: UserCheck,
    title: "Compte validé",
    description:
      "L’administrateur habilite les médecins et pharmaciens avant tout accès aux données de santé.",
  },
  {
    icon: ClipboardCheck,
    title: "Dossier ouvert",
    description:
      "Le patient ou son représentant dispose d’un identifiant unique et autorise les consultations.",
  },
  {
    icon: FileText,
    title: "Consultation & ordonnance",
    description:
      "Le médecin alimente le dossier et émet une prescription sécurisée par QR code.",
  },
  {
    icon: Pill,
    title: "Délivrance tracée",
    description:
      "Le pharmacien vérifie le QR code, enregistre la délivrance et met à jour son stock déclaré.",
  },
];

type Profile = {
  role: string;
  description: string;
  image: string | null;
  icon: LucideIcon;
  accent: string;
};

const profiles: Profile[] = [
  {
    role: "Patient / représentant",
    description:
      "Consulte ses données, suit ses rendez-vous et trouve les officines disposant de son traitement.",
    image: "/images/profil-patient.svg",
    icon: Users,
    accent: "from-emerald-50 to-teal-100",
  },
  {
    role: "Médecin",
    description:
      "Consulte l’historique autorisé, rédige les consultations et prescrit des ordonnances sécurisées.",
    image: "/images/profil-medecin.svg",
    icon: Stethoscope,
    accent: "from-sky-50 to-emerald-100",
  },
  {
    role: "Pharmacien",
    description:
      "Gère son catalogue et ses stocks, scanne les QR codes et enregistre les délivrances.",
    image: "/images/profil-pharmacien.svg",
    icon: Pill,
    accent: "from-teal-50 to-cyan-100",
  },
  {
    role: "Administrateur",
    description:
      "Valide les comptes professionnels, configure les référentiels et suit les indicateurs globaux.",
    image: null,
    icon: ShieldCheck,
    accent: "from-indigo-50 to-emerald-100",
  },
];

const testimonials = [
  {
    quote:
      "Je retrouve en quelques secondes l’historique d’un patient, même lorsque je consulte dans une nouvelle structure.",
    role: "Médecin — Conakry",
    icon: Stethoscope,
  },
  {
    quote:
      "Le QR code me permet de vérifier l’ordonnance avant la délivrance. Plus d’ambiguïté sur son statut.",
    role: "Pharmacien — Conakry",
    icon: Pill,
  },
  {
    quote:
      "Je vois les médicaments disponibles près de chez moi et je contacte directement l’officine sur WhatsApp.",
    role: "Patient — Conakry",
    icon: MessageCircle,
  },
];

const faqs = [
  {
    question: "Qui peut utiliser SantéLink ?",
    answer:
      "La plateforme s’adresse à quatre profils : administrateurs, médecins, pharmaciens et patients ou représentants légaux. Les comptes de professionnels de santé sont validés par un administrateur avant activation.",
  },
  {
    question: "Mes données médicales sont-elles protégées ?",
    answer:
      "Oui. Les communications sont chiffrées, les mots de passe hachés, les accès contrôlés par rôle et chaque action sensible est journalisée. Le secret médical et la confidentialité sont au cœur de la conception.",
  },
  {
    question: "Faut-il une connexion permanente ?",
    answer:
      "Non. SantéLink est une application web progressive, utilisable sur mobile et desktop. Les écrans sont légers pour fonctionner malgré une connectivité variable ; les données sensibles restent synchronisées dès que la connexion revient.",
  },
  {
    question: "SantéLink remplace-t-il le dossier hospitalier officiel ?",
    answer:
      "Non. Dans ce premier jalon, SantéLink ne remplace pas les dossiers hospitaliers officiels sans validation institutionnelle et ne réalise aucun diagnostic automatisé. Il accompagne le jugement du praticien.",
  },
];

function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[420px] overflow-hidden rounded-[28px] border border-white/60 bg-slate-900 shadow-2xl shadow-emerald-900/10 sm:h-[460px] lg:h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={slide.badge}
            aria-hidden={index !== active}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              unoptimized
              className={`object-cover transition-transform duration-[8000ms] ease-linear ${
                index === active ? "scale-105" : "scale-100"
              }`}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`}
            />
            <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-8 sm:p-12 lg:p-16">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {slide.badge}
              </span>
              <h3 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {slide.title}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(-1)}
        aria-label="Diapositive précédente"
        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 sm:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(1)}
        aria-label="Diapositive suivante"
        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 sm:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2 sm:right-12">
        {slides.map((slide, index) => (
          <button
            key={slide.badge}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Afficher la diapositive ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === active ? "w-8 bg-emerald-300" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-emerald-950 px-7 py-10 text-white shadow-xl shadow-emerald-950/20 sm:px-12 sm:py-14">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative min-h-[190px]">
        {testimonials.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.role}
              className={`flex flex-col items-start gap-5 transition-all duration-500 ${
                index === active ? "animate-fade-up opacity-100" : "absolute inset-0 opacity-0"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Icon className="h-6 w-6 text-emerald-300" />
              </div>
              <blockquote className="max-w-3xl text-xl font-medium leading-relaxed text-white sm:text-2xl">
                « {item.quote} »
              </blockquote>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                {item.role}
              </p>
            </div>
          );
        })}
      </div>
      <div className="relative mt-6 flex gap-2">
        {testimonials.map((item, index) => (
          <button
            key={item.role}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Voir le témoignage ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? "w-10 bg-emerald-300" : "w-4 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <noscript>
        <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#accueil" className="group flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-transform group-hover:rotate-6">
              <HeartPulse className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Santé<span className="text-emerald-600">Link</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                S’inscrire
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section id="accueil" className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-sante-guinee.svg"
              alt=""
              fill
              unoptimized
              priority
              className="object-cover object-right"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(16,185,129,0.20),transparent_45%)]" />
            <div className="absolute inset-0 bg-grid opacity-40" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Conçu pour la Guinée
              </span>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Le bon soin,
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-200 bg-clip-text text-transparent">
                  au bon moment.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                SantéLink connecte patients, médecins et pharmaciens autour d’un
                dossier patient unifié. Des ordonnances vérifiables, des stocks
                visibles et une coordination enfin fluide — même avec une
                connexion variable.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  Commencer avec SantéLink
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#en-action"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/10"
                >
                  Voir la plateforme en action
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secret médical préservé
                </span>
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-400" /> Mobile & PWA
                </span>
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" /> Traçabilité complète
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="animate-float absolute bottom-6 right-0 w-[320px] rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    La plateforme en un coup d’œil
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: "4", label: "profils" },
                    { value: "1", label: "dossier patient" },
                    { value: "QR", label: "vérifiable" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-white/10 py-3">
                      <div className="text-2xl font-extrabold text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] text-emerald-100/80">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-100/80">
                  <Check className="h-4 w-4 text-emerald-300" />
                  piloté depuis Conakry
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ── Repères de confiance ── */}
        <section className="border-b border-slate-100 bg-white py-7">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm font-medium text-slate-500 sm:px-6 lg:px-8">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" /> Pilote à Conakry
            </span>
            <span>Extension : Labé · Kankan · Nzérékoré</span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" /> Données chiffrées
            </span>
            <span className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-emerald-600" /> Suivi au long cours
            </span>
          </div>
        </section>

        {/* ── Carrousel ── */}
        <section id="en-action" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <span className="eyebrow">En action</span>
                <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Trois gestes concrets, tout un parcours de soins.
                </h2>
                <p className="mt-4 text-slate-600">
                  De la consultation à la délivrance, chaque étape est simple,
                  vérifiable et pensée pour les réalités du terrain.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="animate-pulse-soft h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Défilement automatique · utilisez les flèches
              </div>
            </div>
            <div className="reveal">
              <Carousel />
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section id="fonctionnalites" className="relative overflow-hidden py-20 sm:py-24">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal mx-auto max-w-2xl text-center">
              <span className="eyebrow">Fonctionnalités</span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Une plateforme complète, sans complexité inutile.
              </h2>
              <p className="mt-4 text-slate-600">
                Des modules interconnectés qui répondent aux problèmes réels :
                historique introuvable, examens répétés, ordonnances non
                vérifiables et stocks mal connus.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="reveal group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    <div
                      className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${feature.tone}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      Fait pour le terrain
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Parcours de soins ── */}
        <section id="parcours" className="bg-emerald-950 py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal mx-auto max-w-2xl text-center">
              <span className="eyebrow eyebrow-light">Parcours de soins</span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Du compte validé à la délivrance tracée.
              </h2>
              <p className="mt-4 text-emerald-100/75">
                Un flux clair, sécurisé et traçable du premier accès jusqu’à la
                remise du médicament.
              </p>
            </div>

            <div className="relative mt-14 grid gap-6 md:grid-cols-4">
              <div className="absolute left-8 right-8 top-8 hidden h-px bg-white/15 md:block" />
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="reveal relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-emerald-300/30 hover:bg-white/10"
                    style={{ transitionDelay: `${index * 90}ms` }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/25">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="text-4xl font-black text-white/10">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-100/70">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Profils ── */}
        <section id="profils" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <span className="eyebrow">Quatre profils, un même dossier</span>
                <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Chaque acteur a le bon accès, au bon moment.
                </h2>
              </div>
              <p className="max-w-md text-slate-600">
                Les rôles sont étanches : chacun voit ce qu’il doit voir,
                chaque action est attribuée, aucun accès n’est laissé au hasard.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {profiles.map((profile, index) => {
                const Icon = profile.icon;
                return (
                  <article
                    key={profile.role}
                    className="reveal group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${profile.accent}`}>
                      {profile.image ? (
                        <Image
                          src={profile.image}
                          alt={`Illustration du profil ${profile.role}`}
                          fill
                          unoptimized
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/70 text-emerald-700 shadow-lg ring-1 ring-emerald-100">
                            <Icon className="h-11 w-11" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900">{profile.role}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {profile.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="reveal mt-14">
              <Testimonials />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div className="reveal">
              <span className="eyebrow">Questions fréquentes</span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Les réponses avant de commencer.
              </h2>
              <p className="mt-4 text-slate-600">
                SantéLink est un outil d’appui à la coordination des soins :
                il n’est ni un diagnostic automatisé ni un remplacement des
                dossiers officiels.
              </p>
              <Link
                href="/auth/register"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Créer mon espace santé
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="reveal group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow open:shadow-md"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-emerald-600 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Appel final ── */}
        <section className="relative overflow-hidden py-20 sm:py-24">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-sante-guinee.svg"
              alt=""
              fill
              unoptimized
              className="object-cover object-right"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-emerald-950/88" />
            <div className="absolute inset-0 bg-grid opacity-30" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6">
            <div className="reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" /> Ensemble, pour des soins mieux coordonnés
              </span>
              <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Faites circuler l’information, pas les papiers.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-emerald-100/80">
                Rejoignez une plateforme pensée pour la Guinée, les patients et
                les professionnels de santé qui œuvrent chaque jour sur le terrain.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                >
                  Créer mon compte
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/10"
                >
                  J’ai déjà un compte
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="#accueil" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <span className="text-lg font-extrabold text-white">
                  Santé<span className="text-emerald-400">Link</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                Plateforme d’interopérabilité et de coordination des soins en
                République de Guinée. Un dossier, quatre profils, des soins mieux
                reliés.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Découvrir</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navLinks.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Profils</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>Patient / représentant</li>
                <li>Médecin</li>
                <li>Pharmacien</li>
                <li>Administrateur</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Déploiement</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>Conakry — pilote</li>
                <li>Labé · Kankan</li>
                <li>Nzérékoré</li>
              </ul>
              <Link
                href="/auth/login"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Espace professionnel
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SantéLink — Coordination des soins en
              Guinée.
            </p>
            <p>Conçu pour le terrain. Pensé pour le patient.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
