import type { Role } from "@trustvibe/shared";
import { USERS } from "../data/users";
import type { Contractor, DemoUser, User } from "../types";
import type { UserProfile } from "../services/api";

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

export function findDemoUserByEmail(email: string): DemoUser | null {
  return USERS.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function toStableDemoUserId(uid: string, email: string | null): string {
  if (email && emailToStableId[email]) {
    return emailToStableId[email];
  }
  return uid;
}

export function mapProfileToDemoUser(
  profile: UserProfile | null,
  fallbackEmail: string | null
): DemoUser {
  const matchedByEmail = fallbackEmail ? findDemoUserByEmail(fallbackEmail) : null;
  if (matchedByEmail) {
    return { ...matchedByEmail };
  }

  const role = profile?.role ?? roleFromEmail(fallbackEmail ?? "");
  const base: User = {
    id: toStableDemoUserId(profile?.id ?? "demo-user", fallbackEmail),
    email: profile?.email ?? fallbackEmail ?? "demo@trustvibe.test",
    password: "",
    role,
    name: profile?.name || "TrustVibe User",
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
      businessName: profile?.name ?? "Trusted Contractor",
      specialty: ["General"],
      rating: 4.8,
      reviewCount: 0,
      completedJobs: 0,
      bio: "Verified TrustVibe contractor profile.",
      portfolioImages: [],
      insuranceVerified: true,
      responseTime: "< 4 hours",
      badges: ["Verified"],
    };
    return contractor;
  }

  return base;
}
