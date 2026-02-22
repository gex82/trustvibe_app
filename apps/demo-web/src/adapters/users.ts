import type { Role } from "@trustvibe/shared";
import { getUsers } from "../data/users";
import type { Contractor, DemoUser, User } from "../types";
import type { UserProfile } from "../services/api";
import type { DemoLang } from "../utils/localization";

const emailToStableId: Record<string, string> = {
  "maria.rodriguez@trustvibe.test": "user-maria",
  "juan.services@trustvibe.test": "user-juan",
  "admin@trustvibe.test": "user-admin",
};

function roleFromEmail(email: string): Role {
  if (email.includes("admin")) {
    return "admin";
  }
  if (email.includes("juan") || email.includes("contractor")) {
    return "contractor";
  }
  return "customer";
}

export function findDemoUserByEmail(
  email: string,
  lang: DemoLang = "en"
): DemoUser | null {
  return (
    getUsers(lang).find((item) => item.email.toLowerCase() === email.toLowerCase()) ??
    null
  );
}

export function toStableDemoUserId(uid: string, email: string | null): string {
  if (email && emailToStableId[email]) {
    return emailToStableId[email];
  }
  return uid;
}

export function mapProfileToDemoUser(
  profile: UserProfile | null,
  fallbackEmail: string | null,
  lang: DemoLang = "en"
): DemoUser {
  const matchedByEmail = fallbackEmail ? findDemoUserByEmail(fallbackEmail, lang) : null;
  if (matchedByEmail) {
    return { ...matchedByEmail };
  }

  const role = profile?.role ?? roleFromEmail(fallbackEmail ?? "");
  const base: User = {
    id: toStableDemoUserId(profile?.id ?? "demo-user", fallbackEmail),
    email: profile?.email ?? fallbackEmail ?? "demo@trustvibe.test",
    password: "",
    role,
    name: profile?.name || (lang === "es" ? "Usuario TrustVibe" : "TrustVibe User"),
    avatarUrl: profile?.avatarUrl ?? "/images/contractors/maria-rodriguez.png",
    phone: profile?.phone,
    location: "Puerto Rico",
    memberSince: new Date().toISOString().slice(0, 7),
    verified: true,
  };

  if (role === "contractor") {
    const contractor: Contractor = {
      ...base,
      role: "contractor",
      businessName: profile?.name ?? (lang === "es" ? "Contratista Confiable" : "Trusted Contractor"),
      specialty: ["General"],
      rating: 4.8,
      reviewCount: 0,
      completedJobs: 0,
      bio:
        lang === "es"
          ? "Perfil de contratista TrustVibe verificado."
          : "Verified TrustVibe contractor profile.",
      portfolioImages: [],
      insuranceVerified: true,
      responseTime: lang === "es" ? "< 4 horas" : "< 4 hours",
      badges: [lang === "es" ? "Verificado" : "Verified"],
    };
    return contractor;
  }

  return base;
}
