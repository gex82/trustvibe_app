import type { EarningsRecord } from "../types";
import type { LocalizedEarningsSource } from "../types/localized";
import { getLocalizedField, type DemoLang } from "../utils/localization";

export const EARNINGS_SOURCES: LocalizedEarningsSource[] = [
  {
    id: "earn-1",
    projectId: "proj-sample-3",
    projectTitle: "Guest Bathroom Remodel",
    projectTitleEn: "Guest Bathroom Remodel",
    projectTitleEs: "Remodelación de Baño de Visitas",
    customerName: "Andres P.",
    amount: 3200,
    fee: 224,
    netPaid: 2976,
    paidAt: "2025-09-05",
    status: "paid",
  },
  {
    id: "earn-2",
    projectId: "proj-sample-2",
    projectTitle: "Plumbing Leak Repair",
    projectTitleEn: "Plumbing Leak Repair",
    projectTitleEs: "Reparación de Fuga de Plomería",
    customerName: "Roberto M.",
    amount: 420,
    fee: 42,
    netPaid: 378,
    paidAt: "2025-11-22",
    status: "paid",
  },
  {
    id: "earn-3",
    projectId: "proj-sample-1",
    projectTitle: "Master Bathroom Renovation",
    projectTitleEn: "Master Bathroom Renovation",
    projectTitleEs: "Renovación de Baño Principal",
    customerName: "Sofia L.",
    amount: 2950,
    fee: 207,
    netPaid: 2743,
    paidAt: "2025-12-18",
    status: "paid",
  },
  {
    id: "earn-4",
    projectId: "proj-bathroom",
    projectTitle: "Primary Bathroom Renovation",
    projectTitleEn: "Primary Bathroom Renovation",
    projectTitleEs: "Remodelación de Baño Principal",
    customerName: "Maria R.",
    amount: 2800,
    fee: 196,
    netPaid: 2604,
    paidAt: "2026-02-19",
    status: "held",
  },
  {
    id: "earn-5",
    projectId: "proj-solar",
    projectTitle: "Solar Panel Installation (8 Panels)",
    projectTitleEn: "Solar Panel Installation (8 Panels)",
    projectTitleEs: "Instalación de Paneles Solares (8 Paneles)",
    customerName: "Pedro V.",
    amount: 7200,
    fee: 300,
    netPaid: 6900,
    paidAt: "2026-02-14",
    status: "pending",
  },
];

export function getEarnings(lang: DemoLang): EarningsRecord[] {
  return EARNINGS_SOURCES.map((entry) => ({
    ...entry,
    projectTitle: getLocalizedField(
      entry as unknown as Record<string, unknown>,
      "projectTitle",
      lang,
      entry.projectTitle
    ),
  }));
}

export const EARNINGS: EarningsRecord[] = getEarnings("en");
