import type { User, Contractor } from "../types";
import { getLocalizedField, type DemoLang } from "../utils/localization";

type LocalizedContractorRecord = Contractor & {
  businessNameEn?: string;
  businessNameEs?: string;
  specialtyEn?: string[];
  specialtyEs?: string[];
  bioEn?: string;
  bioEs?: string;
  badgesEn?: string[];
  badgesEs?: string[];
  responseTimeEn?: string;
  responseTimeEs?: string;
};

export const USER_SOURCES: (User | LocalizedContractorRecord)[] = [
  {
    id: "user-maria",
    email: "maria.rodriguez@trustvibe.test",
    password: "DemoCustomer!123",
    role: "customer",
    name: "Maria Rodriguez",
    avatarUrl: "/images/contractors/maria-rodriguez.png",
    phone: "(787) 555-0191",
    location: "San Juan, PR",
    memberSince: "2024-03",
    verified: true,
  },
  {
    id: "user-juan",
    email: "juan.services@trustvibe.test",
    password: "DemoContractor!123",
    role: "contractor",
    name: "Juan Reyes",
    businessName: "Juan's Home Services",
    businessNameEn: "Juan's Home Services",
    businessNameEs: "Servicios del Hogar de Juan",
    avatarUrl: "/images/contractors/juan-reyes.png",
    phone: "(787) 555-0234",
    location: "San Juan, PR",
    memberSince: "2023-11",
    verified: true,
    specialty: ["Plumbing", "Tile Work", "Bathroom Renovation"],
    specialtyEn: ["Plumbing", "Tile Work", "Bathroom Renovation"],
    specialtyEs: ["Plomería", "Trabajo en Losas", "Remodelación de Baño"],
    rating: 4.8,
    reviewCount: 31,
    completedJobs: 23,
    reliabilityScore: 96,
    bio: "15+ years experience in residential plumbing and bathroom renovation. Licensed and insured. Serving the San Juan metro area. I take pride in clean work and clear communication — every project is treated like it's my own home.",
    bioEn:
      "15+ years experience in residential plumbing and bathroom renovation. Licensed and insured. Serving the San Juan metro area. I take pride in clean work and clear communication. Every project is treated like my own home.",
    bioEs:
      "Más de 15 años de experiencia en plomería residencial y remodelación de baños. Licenciado y asegurado. Sirviendo el área metro de San Juan. Me enfoco en trabajo limpio y comunicación clara en cada proyecto.",
    portfolioImages: [
      "/images/jobs/bathroom-renovation.png",
      "/images/jobs/living-room-reno.png",
      "/images/jobs/bedroom-interior.png",
      "/images/jobs/kitchen-cabinets.png",
    ],
    licenseNumber: "PR-CONT-2891",
    insuranceVerified: true,
    responseTime: "< 2 hours",
    responseTimeEn: "< 2 hours",
    responseTimeEs: "< 2 horas",
    badges: ["Top Rated", "Licensed", "Insured", "Background Checked"],
    badgesEn: ["Top Rated", "Licensed", "Insured", "Background Checked"],
    badgesEs: ["Mejor Calificado", "Licenciado", "Asegurado", "Antecedentes Verificados"],
    hourlyRate: 85,
  } as LocalizedContractorRecord,
  {
    id: "user-rosa",
    email: "rosa.plumbing@trustvibe.test",
    password: "DemoContractor!123",
    role: "contractor",
    name: "Rosa Morales",
    businessName: "Rosa Plumbing Pro",
    businessNameEn: "Rosa Plumbing Pro",
    businessNameEs: "Rosa Plumbing Pro",
    avatarUrl: "/images/contractors/rosa-morales.png",
    phone: "(787) 555-0312",
    location: "Bayamón, PR",
    memberSince: "2024-01",
    verified: true,
    specialty: ["Plumbing", "Water Heaters", "Pipe Repair"],
    specialtyEn: ["Plumbing", "Water Heaters", "Pipe Repair"],
    specialtyEs: ["Plomería", "Calentadores de Agua", "Reparación de Tuberías"],
    rating: 4.6,
    reviewCount: 22,
    completedJobs: 15,
    reliabilityScore: 88,
    bio: "Specialized plumbing contractor with focus on water systems and emergency repairs. Fast response, quality work. Licensed and insured in Puerto Rico.",
    bioEn:
      "Specialized plumbing contractor focused on water systems and emergency repairs. Fast response and quality work. Licensed and insured in Puerto Rico.",
    bioEs:
      "Contratista especializado en plomería con enfoque en sistemas de agua y reparaciones de emergencia. Respuesta rápida y trabajo de calidad. Licenciada y asegurada en Puerto Rico.",
    portfolioImages: [
      "/images/jobs/roof-repair.png",
      "/images/jobs/solar-install.png",
      "/images/jobs/exterior-painting.png",
    ],
    licenseNumber: "PR-CONT-3142",
    insuranceVerified: true,
    responseTime: "< 4 hours",
    responseTimeEn: "< 4 hours",
    responseTimeEs: "< 4 horas",
    badges: ["Licensed", "Insured"],
    badgesEn: ["Licensed", "Insured"],
    badgesEs: ["Licenciado", "Asegurado"],
    hourlyRate: 75,
  } as LocalizedContractorRecord,
  {
    id: "user-carlos",
    email: "carlos.electric@trustvibe.test",
    password: "DemoContractor!123",
    role: "contractor",
    name: "Carlos Vega",
    businessName: "Vega Electric & More",
    businessNameEn: "Vega Electric & More",
    businessNameEs: "Vega Electric & More",
    avatarUrl: "/images/contractors/carlos-vega.png",
    phone: "(787) 555-0455",
    location: "Caguas, PR",
    memberSince: "2023-08",
    verified: true,
    specialty: ["Electrical", "Solar Installation", "Panel Upgrades", "Ceiling Fans"],
    specialtyEn: ["Electrical", "Solar Installation", "Panel Upgrades", "Ceiling Fans"],
    specialtyEs: ["Electricidad", "Instalación Solar", "Mejoras de Panel", "Abanicos de Techo"],
    rating: 4.7,
    reviewCount: 18,
    completedJobs: 19,
    reliabilityScore: 91,
    bio: "Master electrician with 12 years in residential and light commercial electrical work. NABCEP-certified solar installer — 14 residential solar installs across Puerto Rico. All permits pulled, net metering paperwork handled. Fast, clean, safe.",
    bioEn:
      "Master electrician with 12 years in residential and light commercial work. NABCEP-certified solar installer with 14 residential installs in Puerto Rico. Permits and net metering paperwork included.",
    bioEs:
      "Maestro electricista con 12 años en trabajo residencial y comercial liviano. Instalador solar certificado NABCEP con 14 instalaciones residenciales en Puerto Rico. Incluye permisos y trámites de medición neta.",
    portfolioImages: [
      "/images/jobs/solar-install.png",
      "/images/jobs/exterior-painting.png",
    ],
    licenseNumber: "PR-ELEC-1847",
    insuranceVerified: true,
    responseTime: "< 3 hours",
    responseTimeEn: "< 3 hours",
    responseTimeEs: "< 3 horas",
    badges: ["Licensed", "Insured", "Permit-Ready"],
    badgesEn: ["Licensed", "Insured", "Permit-Ready"],
    badgesEs: ["Licenciado", "Asegurado", "Listo para Permisos"],
    hourlyRate: 90,
  } as LocalizedContractorRecord,
  {
    id: "user-admin",
    email: "admin@trustvibe.test",
    password: "DemoAdmin!123",
    role: "admin",
    name: "Admin",
    avatarUrl: "/images/contractors/maria-rodriguez.png",
    location: "San Juan, PR",
    memberSince: "2023-01",
    verified: true,
  },
];

function localizeContractor(
  source: LocalizedContractorRecord,
  lang: DemoLang
): Contractor {
  const specialty = lang === "es" ? source.specialtyEs ?? source.specialty : source.specialtyEn ?? source.specialty;
  const badges = lang === "es" ? source.badgesEs ?? source.badges : source.badgesEn ?? source.badges;

  return {
    ...source,
    businessName: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "businessName",
      lang,
      source.businessName
    ),
    bio: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "bio",
      lang,
      source.bio
    ),
    responseTime: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "responseTime",
      lang,
      source.responseTime
    ),
    specialty,
    badges,
  };
}

function localizeUser(source: User | LocalizedContractorRecord, lang: DemoLang): User | Contractor {
  if (source.role !== "contractor") {
    return { ...source };
  }
  return localizeContractor(source as LocalizedContractorRecord, lang);
}

export function getUsers(lang: DemoLang = "en"): (User | Contractor)[] {
  return USER_SOURCES.map((user) => localizeUser(user, lang));
}

export const USERS: (User | Contractor)[] = getUsers("en");

export function findUserByCredentials(
  email: string,
  password: string,
  lang: DemoLang = "en"
): User | Contractor | null {
  return (
    getUsers(lang).find((u) => u.email === email && u.password === password) ?? null
  );
}

export function findUserById(id: string, lang: DemoLang = "en"): User | Contractor | null {
  return getUsers(lang).find((u) => u.id === id) ?? null;
}

export function getContractors(lang: DemoLang = "en"): Contractor[] {
  return getUsers(lang).filter((u): u is Contractor => u.role === "contractor");
}
