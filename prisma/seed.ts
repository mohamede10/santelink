import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SantéLink database...\n");

  // ── 1. Créer l'administrateur ──────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@santelink.gn" },
    update: {},
    create: {
      email: "admin@santelink.gn",
      passwordHash: adminPassword,
      nom: "Diallo",
      prenom: "Mamadou",
      telephone: "+224620000001",
      role: "ADMIN",
      statutCompte: "VALIDE",
    },
  });
  console.log(`✅ Admin créé: ${admin.email}`);

  // ── 2. Créer des médecins ─────────────────────────────────────────────
  const medecinPassword = await bcrypt.hash("medecin1234", 12);

  const medecin1User = await prisma.user.upsert({
    where: { email: "dr.camara@santelink.gn" },
    update: {},
    create: {
      email: "dr.camara@santelink.gn",
      passwordHash: medecinPassword,
      nom: "Camara",
      prenom: "Fatoumata",
      telephone: "+224621000001",
      role: "MEDECIN",
      statutCompte: "VALIDE",
      valideParId: admin.id,
    },
  });
  const medecin1 = await prisma.medecin.upsert({
    where: { userId: medecin1User.id },
    update: {},
    create: {
      userId: medecin1User.id,
      numOrdre: "MED-GN-2024-001",
      specialite: "Médecine générale",
      structure: "Hôpital National Donka",
      adresseStructure: "Conakry, Kaloum",
      telephoneStructure: "+224622111111",
    },
  });
  console.log(`✅ Médecin créé: Dr. ${medecin1User.prenom} ${medecin1User.nom}`);

  const medecin2User = await prisma.user.upsert({
    where: { email: "dr.bah@santelink.gn" },
    update: {},
    create: {
      email: "dr.bah@santelink.gn",
      passwordHash: medecinPassword,
      nom: "Bah",
      prenom: "Ibrahima",
      telephone: "+224621000002",
      role: "MEDECIN",
      statutCompte: "VALIDE",
      valideParId: admin.id,
    },
  });
  await prisma.medecin.upsert({
    where: { userId: medecin2User.id },
    update: {},
    create: {
      userId: medecin2User.id,
      numOrdre: "MED-GN-2024-002",
      specialite: "Pédiatrie",
      structure: "Clinique Ambroise Paré",
      adresseStructure: "Conakry, Ratoma",
    },
  });
  console.log(`✅ Médecin créé: Dr. ${medecin2User.prenom} ${medecin2User.nom}`);

  // ── 3. Créer des pharmaciens ──────────────────────────────────────────
  const pharmacienPassword = await bcrypt.hash("pharma1234", 12);

  const pharma1User = await prisma.user.upsert({
    where: { email: "pharma.sylla@santelink.gn" },
    update: {},
    create: {
      email: "pharma.sylla@santelink.gn",
      passwordHash: pharmacienPassword,
      nom: "Sylla",
      prenom: "Aissatou",
      telephone: "+224623000001",
      role: "PHARMACIEN",
      statutCompte: "VALIDE",
      valideParId: admin.id,
    },
  });
  const pharma1 = await prisma.pharmacien.upsert({
    where: { userId: pharma1User.id },
    update: {},
    create: {
      userId: pharma1User.id,
      numAutorisation: "PH-GN-2024-001",
      nomOfficine: "Pharmacie Centrale de Kaloum",
      adresseOfficine: "Avenue de la République, Kaloum, Conakry",
      telephoneOfficine: "+224624000001",
      whatsapp: "+224624000001",
      horaires: JSON.stringify({ lun_ven: "08:00-20:00", sam: "08:00-14:00", dim: "Fermé" }),
    },
  });
  console.log(`✅ Pharmacien créé: ${pharma1.nomOfficine}`);

  // ── 4. Créer des patients ─────────────────────────────────────────────
  const patientPassword = await bcrypt.hash("patient1234", 12);

  const patient1User = await prisma.user.upsert({
    where: { email: "oumar.barry@email.com" },
    update: {},
    create: {
      email: "oumar.barry@email.com",
      passwordHash: patientPassword,
      nom: "Barry",
      prenom: "Oumar",
      telephone: "+224625000001",
      role: "PATIENT",
      statutCompte: "VALIDE",
    },
  });
  const patient1 = await prisma.patient.upsert({
    where: { userId: patient1User.id },
    update: {},
    create: {
      userId: patient1User.id,
      numDossier: "PAT-2024-00001",
      dateNaissance: new Date("1985-03-15"),
      sexe: "M",
      adresse: "Quartier Madina, Commune de Matam, Conakry",
      groupeSanguin: "O+",
    },
  });
  console.log(`✅ Patient créé: ${patient1User.prenom} ${patient1User.nom} (${patient1.numDossier})`);

  const patient2User = await prisma.user.upsert({
    where: { email: "mariama.sow@email.com" },
    update: {},
    create: {
      email: "mariama.sow@email.com",
      passwordHash: patientPassword,
      nom: "Sow",
      prenom: "Mariama",
      telephone: "+224625000002",
      role: "PATIENT",
      statutCompte: "VALIDE",
    },
  });
  const patient2 = await prisma.patient.upsert({
    where: { userId: patient2User.id },
    update: {},
    create: {
      userId: patient2User.id,
      numDossier: "PAT-2024-00002",
      dateNaissance: new Date("1992-07-22"),
      sexe: "F",
      adresse: "Quartier Kipé, Commune de Ratoma, Conakry",
      groupeSanguin: "A+",
    },
  });
  console.log(`✅ Patient créé: ${patient2User.prenom} ${patient2User.nom} (${patient2.numDossier})`);

  // ── 5. Créer des médicaments de référence ─────────────────────────────
  const medicaments = await Promise.all([
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Paracétamol", forme: "Comprimé", dosage: "500mg" } },
      update: {},
      create: { nomDci: "Paracétamol", nomCommercial: "Doliprane", forme: "Comprimé", dosage: "500mg", voieAdmin: "Orale", categorie: "Antalgique" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Amoxicilline", forme: "Gélule", dosage: "500mg" } },
      update: {},
      create: { nomDci: "Amoxicilline", nomCommercial: "Clamoxyl", forme: "Gélule", dosage: "500mg", voieAdmin: "Orale", categorie: "Antibiotique" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Ibuprofène", forme: "Comprimé", dosage: "400mg" } },
      update: {},
      create: { nomDci: "Ibuprofène", nomCommercial: "Advil", forme: "Comprimé", dosage: "400mg", voieAdmin: "Orale", categorie: "AINS" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Métronidazole", forme: "Comprimé", dosage: "250mg" } },
      update: {},
      create: { nomDci: "Métronidazole", nomCommercial: "Flagyl", forme: "Comprimé", dosage: "250mg", voieAdmin: "Orale", categorie: "Antiparasitaire" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Oméprazole", forme: "Gélule", dosage: "20mg" } },
      update: {},
      create: { nomDci: "Oméprazole", nomCommercial: "Mopral", forme: "Gélule", dosage: "20mg", voieAdmin: "Orale", categorie: "IPP" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Artéméther-Luméfantrine", forme: "Comprimé", dosage: "20/120mg" } },
      update: {},
      create: { nomDci: "Artéméther-Luméfantrine", nomCommercial: "Coartem", forme: "Comprimé", dosage: "20/120mg", voieAdmin: "Orale", categorie: "Antipaludéen" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Chlorure de Sodium", forme: "Solution injectable", dosage: "0.9%" } },
      update: {},
      create: { nomDci: "Chlorure de Sodium", nomCommercial: "Sérum physiologique", forme: "Solution injectable", dosage: "0.9%", voieAdmin: "IV", categorie: "Soluté" },
    }),
    prisma.medicament.upsert({
      where: { nomDci_forme_dosage: { nomDci: "Salbutamol", forme: "Aérosol", dosage: "100µg/dose" } },
      update: {},
      create: { nomDci: "Salbutamol", nomCommercial: "Ventoline", forme: "Aérosol", dosage: "100µg/dose", voieAdmin: "Inhalation", categorie: "Bronchodilatateur" },
    }),
  ]);
  console.log(`✅ ${medicaments.length} médicaments créés`);

  // ── 6. Créer des stocks pour la pharmacie ─────────────────────────────
  for (const med of medicaments.slice(0, 6)) {
    await prisma.stockMedicament.upsert({
      where: {
        pharmacienId_medicamentId: {
          pharmacienId: pharma1.id,
          medicamentId: med.id,
        },
      },
      update: {},
      create: {
        pharmacienId: pharma1.id,
        medicamentId: med.id,
        quantite: Math.floor(Math.random() * 200) + 20,
        prixUnitaire: Math.floor(Math.random() * 50000) + 5000,
        seuilAlerte: 15,
      },
    });
  }
  console.log("✅ Stocks pharmaceutiques initialisés");

  // ── 7. Créer une consultation de démo ─────────────────────────────────
  const consultation = await prisma.consultation.create({
    data: {
      patientId: patient1.id,
      medecinId: medecin1.id,
      typeConsultation: "PREMIERE_VISITE",
      motif: "Fièvre persistante et douleurs articulaires depuis 3 jours",
      diagnostic: "Suspicion de paludisme - TDR positif",
      notes: "Patient orienté vers le laboratoire pour confirmation GE/FS. Traitement antipaludéen initié.",
      poids: 72,
      taille: 175,
      tension: "120/80",
      temperature: 38.9,
    },
  });
  console.log(`✅ Consultation de démo créée`);

  // ── 8. Créer des antécédents ──────────────────────────────────────────
  await prisma.antecedent.createMany({
    data: [
      { patientId: patient1.id, type: "MEDICAL", description: "Paludisme récurrent (3 épisodes en 2023)" },
      { patientId: patient1.id, type: "ALLERGIQUE", description: "Allergie connue à la Pénicilline" },
    ],
    skipDuplicates: true,
  });

  await prisma.allergie.create({
    data: {
      patientId: patient1.id,
      substance: "Pénicilline",
      reaction: "Éruption cutanée, urticaire",
      severite: "MODEREE",
    },
  });
  console.log("✅ Antécédents et allergies créés");

  // ── 9. Créer un audit log initial ─────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATABASE",
      entite: "System",
      details: { message: "Base de données initialisée avec données de démo" },
    },
  });

  console.log("\n✨ Seed terminé avec succès !\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║           Comptes de démonstration SantéLink         ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║ 👑 Admin:      admin@santelink.gn / admin1234       ║");
  console.log("║ 👨‍⚕️ Médecin:    dr.camara@santelink.gn / medecin1234║");
  console.log("║ 💊 Pharmacien: pharma.sylla@santelink.gn / pharma1234║");
  console.log("║ 🏥 Patient:    oumar.barry@email.com / patient1234  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
