export type Role = "ADMIN" | "MEDECIN" | "PHARMACIEN" | "PATIENT";
export type StatutCompte = "EN_ATTENTE" | "VALIDE" | "SUSPENDU" | "REJETE";
export type StatutOrdonnance = "VALIDE" | "PARTIELLEMENT_DELIVREE" | "DELIVREE" | "EXPIREE" | "ANNULEE";

export interface SessionUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  statutCompte: StatutCompte;
  photoUrl?: string | null;
  patientId?: string | null;
  medecinId?: string | null;
  pharmacienId?: string | null;
  numDossier?: string | null;
  nomOfficine?: string | null;
  structure?: string | null;
}

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  statutCompte: StatutCompte;
  iat?: number;
  exp?: number;
}
