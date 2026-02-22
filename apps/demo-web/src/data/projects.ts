import type { Project, Quote } from "../types";
import type { LocalizedProjectSource, LocalizedQuoteSource } from "../types/localized";
import { getLocalizedField, type DemoLang } from "../utils/localization";

export const PROJECT_SOURCES: LocalizedProjectSource[] = [
  {
    id: "proj-bathroom",
    customerId: "user-maria",
    contractorId: "user-juan",
    title: "Primary Bathroom Renovation",
    titleEn: "Primary Bathroom Renovation",
    titleEs: "Remodelación de Baño Principal",
    description:
      "Complete renovation of primary bathroom. Remove old tile, install new porcelain tile floor (12×24), replace vanity, install new shower with glass enclosure, repaint. All fixtures are customer-supplied. Bathroom is approx. 8×10 ft.",
    descriptionEn:
      "Complete renovation of primary bathroom. Remove old tile, install new porcelain tile floor (12×24), replace vanity, install new shower with glass enclosure, repaint. All fixtures are customer-supplied. Bathroom is approx. 8×10 ft.",
    descriptionEs:
      "Renovación completa del baño principal. Retiro de azulejo viejo, instalación de piso nuevo de porcelanato (12×24), reemplazo de vanity, instalación de ducha nueva con mampara de cristal y pintura. Todos los accesorios son provistos por el cliente. El baño mide aprox. 8×10 pies.",
    category: "Bathroom",
    categoryEn: "Bathroom",
    categoryEs: "Baño",
    location: "San Juan, PR",
    locationEn: "San Juan, PR",
    locationEs: "San Juan, PR",
    budget: "$2,500 – $3,500",
    budgetEn: "$2,500 – $3,500",
    budgetEs: "$2,500 – $3,500",
    timeline: "3–4 weeks",
    timelineEn: "3–4 weeks",
    timelineEs: "3–4 semanas",
    status: "in_progress",
    createdAt: "2026-01-10",
    photos: [
      "/images/jobs/bathroom-before-after.png",
      "/images/jobs/bathroom-renovation.png",
    ],
    completionPhotos: [
      "/images/jobs/bathroom-before-after.png",
      "/images/jobs/bathroom-renovation.png",
      "/images/jobs/bedroom-interior.png",
    ],
    completionNote:
      "All work is complete! Tile floor installed, shower enclosure done, new vanity fitted and plumbing connected. Final clean-up done. Please inspect and approve when ready.",
    completionNoteEn:
      "All work is complete! Tile floor installed, shower enclosure done, new vanity fitted and plumbing connected. Final clean-up done. Please inspect and approve when ready.",
    completionNoteEs:
      "¡Todo el trabajo está completado! Se instaló el piso en losas, la mampara de ducha, el vanity nuevo y las conexiones de plomería. Se realizó limpieza final. Favor inspeccionar y aprobar cuando estés listo.",
    quotes: [
      {
        id: "quote-juan-bathroom",
        projectId: "proj-bathroom",
        contractorId: "user-juan",
        amount: 2800,
        breakdown: [
          {
            label: "Tile removal & disposal",
            labelEn: "Tile removal & disposal",
            labelEs: "Retiro y disposición de losas",
            amount: 350,
          },
          {
            label: "Floor tile installation (materials incl.)",
            labelEn: "Floor tile installation (materials incl.)",
            labelEs: "Instalación de piso en losa (incluye materiales)",
            amount: 800,
          },
          {
            label: "Shower enclosure installation",
            labelEn: "Shower enclosure installation",
            labelEs: "Instalación de mampara de ducha",
            amount: 650,
          },
          {
            label: "Vanity installation",
            labelEn: "Vanity installation",
            labelEs: "Instalación de vanity",
            amount: 400,
          },
          {
            label: "Plumbing rough-in & fixtures",
            labelEn: "Plumbing rough-in & fixtures",
            labelEs: "Plomería y accesorios",
            amount: 450,
          },
          {
            label: "Paint & finishing",
            labelEn: "Paint & finishing",
            labelEs: "Pintura y terminaciones",
            amount: 150,
          },
        ],
        timeline: "3 weeks",
        timelineEn: "3 weeks",
        timelineEs: "3 semanas",
        notes:
          "I have completed 5 similar renovations this year in Santurce and Condado. All work guaranteed for 1 year. Start date flexible — can begin Monday.",
        notesEn:
          "I have completed 5 similar renovations this year in Santurce and Condado. All work guaranteed for 1 year. Start date flexible — can begin Monday.",
        notesEs:
          "He completado 5 remodelaciones similares este año en Santurce y Condado. Todo el trabajo tiene garantía por 1 año. Fecha de inicio flexible; puedo comenzar el lunes.",
        status: "accepted",
        submittedAt: "2026-01-12",
      },
      {
        id: "quote-rosa-bathroom",
        projectId: "proj-bathroom",
        contractorId: "user-rosa",
        amount: 3100,
        breakdown: [
          {
            label: "Demolition & prep",
            labelEn: "Demolition & prep",
            labelEs: "Demolición y preparación",
            amount: 400,
          },
          {
            label: "Tile work (floor + accent wall)",
            labelEn: "Tile work (floor + accent wall)",
            labelEs: "Trabajo de losa (piso + pared de acento)",
            amount: 950,
          },
          {
            label: "Plumbing (full scope)",
            labelEn: "Plumbing (full scope)",
            labelEs: "Plomería (alcance completo)",
            amount: 900,
          },
          {
            label: "Vanity + shower install",
            labelEn: "Vanity + shower install",
            labelEs: "Instalación de vanity + ducha",
            amount: 650,
          },
          {
            label: "Paint & cleanup",
            labelEn: "Paint & cleanup",
            labelEs: "Pintura y limpieza",
            amount: 200,
          },
        ],
        timeline: "4 weeks",
        timelineEn: "4 weeks",
        timelineEs: "4 semanas",
        notes:
          "Premium materials available on request. Includes 1-year warranty on all plumbing work. I can accommodate a weekend start.",
        notesEn:
          "Premium materials available on request. Includes 1-year warranty on all plumbing work. I can accommodate a weekend start.",
        notesEs:
          "Materiales premium disponibles bajo solicitud. Incluye garantía de 1 año en toda la plomería. Puedo acomodar inicio en fin de semana.",
        status: "rejected",
        submittedAt: "2026-01-13",
      },
    ],
    acceptedQuoteId: "quote-juan-bathroom",
    escrowAmount: 2800,
    trustvibeFee: 196,
  },
  {
    id: "proj-kitchen",
    customerId: "user-maria",
    title: "Kitchen Cabinet Repair & Refinishing",
    titleEn: "Kitchen Cabinet Repair & Refinishing",
    titleEs: "Reparación y Restauración de Gabinetes de Cocina",
    description:
      "Repair 3 cabinet doors that are off-hinges, refinish all upper cabinets (sand + repaint white). Replace all cabinet hardware (18 pulls). Kitchen is approximately 12×14 ft. Customer will supply hardware.",
    descriptionEn:
      "Repair 3 cabinet doors that are off-hinges, refinish all upper cabinets (sand + repaint white). Replace all cabinet hardware (18 pulls). Kitchen is approximately 12×14 ft. Customer will supply hardware.",
    descriptionEs:
      "Reparar 3 puertas de gabinete desajustadas, restaurar todos los gabinetes superiores (lijado + pintura blanca). Reemplazar toda la ferretería (18 tiradores). La cocina mide aprox. 12×14 pies. El cliente provee la ferretería.",
    category: "Kitchen",
    categoryEn: "Kitchen",
    categoryEs: "Cocina",
    location: "San Juan, PR",
    locationEn: "San Juan, PR",
    locationEs: "San Juan, PR",
    budget: "$400 – $600",
    budgetEn: "$400 – $600",
    budgetEs: "$400 – $600",
    timeline: "1 week",
    timelineEn: "1 week",
    timelineEs: "1 semana",
    status: "open",
    createdAt: "2026-02-01",
    photos: ["/images/jobs/kitchen-cabinets.png"],
    quotes: [
      {
        id: "quote-juan-kitchen",
        projectId: "proj-kitchen",
        contractorId: "user-juan",
        amount: 450,
        breakdown: [
          {
            label: "Cabinet door repair (3 doors)",
            labelEn: "Cabinet door repair (3 doors)",
            labelEs: "Reparación de puertas de gabinete (3 puertas)",
            amount: 150,
          },
          {
            label: "Sanding & priming all uppers",
            labelEn: "Sanding & priming all uppers",
            labelEs: "Lijado y primer en gabinetes superiores",
            amount: 100,
          },
          {
            label: "Painting (2 coats, white)",
            labelEn: "Painting (2 coats, white)",
            labelEs: "Pintura (2 manos, blanco)",
            amount: 150,
          },
          {
            label: "Hardware installation (labor)",
            labelEn: "Hardware installation (labor)",
            labelEs: "Instalación de herrajes (mano de obra)",
            amount: 50,
          },
        ],
        timeline: "4–5 days",
        timelineEn: "4–5 days",
        timelineEs: "4–5 días",
        notes:
          "I can start next week Monday. Paint color to be selected by customer — I recommend Benjamin Moore Chantilly Lace for a crisp white.",
        notesEn:
          "I can start next week Monday. Paint color to be selected by customer — I recommend Benjamin Moore Chantilly Lace for a crisp white.",
        notesEs:
          "Puedo empezar el próximo lunes. El color lo selecciona el cliente; recomiendo Benjamin Moore Chantilly Lace para un blanco limpio.",
        status: "pending",
        submittedAt: "2026-02-05",
      },
    ],
  },
  {
    id: "proj-exterior-paint",
    customerId: "user-other-1",
    title: "Exterior House Painting",
    titleEn: "Exterior House Painting",
    titleEs: "Pintura Exterior de Casa",
    description:
      "Full exterior repaint of 2-story single-family home. Approx. 2,400 sq ft exterior surface. Power wash first. Customer-selected colors. Includes trim and fascia.",
    descriptionEn:
      "Full exterior repaint of 2-story single-family home. Approx. 2,400 sq ft exterior surface. Power wash first. Customer-selected colors. Includes trim and fascia.",
    descriptionEs:
      "Repintado exterior completo de casa unifamiliar de 2 pisos. Aprox. 2,400 pies cuadrados de superficie exterior. Incluye lavado a presión previo. Colores seleccionados por el cliente. Incluye molduras y fascia.",
    category: "Painting",
    categoryEn: "Painting",
    categoryEs: "Pintura",
    location: "Bayamón, PR",
    locationEn: "Bayamón, PR",
    locationEs: "Bayamón, PR",
    budget: "$3,000 – $5,000",
    budgetEn: "$3,000 – $5,000",
    budgetEs: "$3,000 – $5,000",
    timeline: "2 weeks",
    timelineEn: "2 weeks",
    timelineEs: "2 semanas",
    status: "open",
    createdAt: "2026-02-10",
    photos: ["/images/jobs/exterior-painting.png"],
    quotes: [],
  },
  {
    id: "proj-solar",
    customerId: "user-other-2",
    title: "Solar Panel Installation (8 Panels)",
    titleEn: "Solar Panel Installation (8 Panels)",
    titleEs: "Instalación de Paneles Solares (8 Paneles)",
    description:
      "Install 8 residential solar panels (320W each, total 2.56 kW system) on south-facing roof. Includes mounting hardware, inverter, charge controller, and connection to main electrical panel. Permit filing and PREPA net metering application included. Home is a 1,500 sq ft single-family residence in Caguas.",
    descriptionEn:
      "Install 8 residential solar panels (320W each, total 2.56 kW system) on south-facing roof. Includes mounting hardware, inverter, charge controller, and connection to main electrical panel. Permit filing and PREPA net metering application included. Home is a 1,500 sq ft single-family residence in Caguas.",
    descriptionEs:
      "Instalar 8 paneles solares residenciales (320W cada uno, total de 2.56 kW) en techo con orientación sur. Incluye herrajes de montaje, inversor, controlador de carga y conexión al panel eléctrico principal. Incluye permisos y solicitud de medición neta con PREPA. Casa unifamiliar de 1,500 pies cuadrados en Caguas.",
    category: "Electrical",
    categoryEn: "Electrical",
    categoryEs: "Electricidad",
    location: "Caguas, PR",
    locationEn: "Caguas, PR",
    locationEs: "Caguas, PR",
    budget: "$6,000 – $9,000",
    budgetEn: "$6,000 – $9,000",
    budgetEs: "$6,000 – $9,000",
    timeline: "3–5 days",
    timelineEn: "3–5 days",
    timelineEs: "3–5 días",
    status: "open",
    createdAt: "2026-02-12",
    photos: ["/images/jobs/solar-install.png"],
    quotes: [
      {
        id: "quote-carlos-solar",
        projectId: "proj-solar",
        contractorId: "user-carlos",
        amount: 7200,
        breakdown: [
          {
            label: "Solar panels (8× 320W panels)",
            labelEn: "Solar panels (8× 320W panels)",
            labelEs: "Paneles solares (8× paneles de 320W)",
            amount: 3200,
          },
          {
            label: "Inverter & charge controller",
            labelEn: "Inverter & charge controller",
            labelEs: "Inversor y controlador de carga",
            amount: 1400,
          },
          {
            label: "Roof mounting hardware & racking",
            labelEn: "Roof mounting hardware & racking",
            labelEs: "Herrajes y rieles de montaje en techo",
            amount: 800,
          },
          {
            label: "Electrical panel connection & wiring",
            labelEn: "Electrical panel connection & wiring",
            labelEs: "Conexión y cableado al panel eléctrico",
            amount: 1200,
          },
          {
            label: "Permit filing & PREPA net metering",
            labelEn: "Permit filing & PREPA net metering",
            labelEs: "Permisos y trámite de medición neta PREPA",
            amount: 600,
          },
        ],
        timeline: "4 days",
        timelineEn: "4 days",
        timelineEs: "4 días",
        notes:
          "I am NABCEP-certified and have completed 14 residential solar installs across Puerto Rico this year. All permits included. Net metering paperwork submitted to PREPA on your behalf. System comes with 25-year panel warranty and 10-year workmanship guarantee.",
        notesEn:
          "I am NABCEP-certified and have completed 14 residential solar installs across Puerto Rico this year. All permits included. Net metering paperwork submitted to PREPA on your behalf. System comes with 25-year panel warranty and 10-year workmanship guarantee.",
        notesEs:
          "Estoy certificado por NABCEP y he completado 14 instalaciones solares residenciales en Puerto Rico este año. Incluye todos los permisos. Tramitamos la medición neta con PREPA por ti. El sistema incluye garantía de 25 años para paneles y 10 años de mano de obra.",
        status: "pending",
        submittedAt: "2026-02-14",
      },
    ],
  },
];

function mapQuote(source: LocalizedQuoteSource, lang: DemoLang): Quote {
  return {
    ...source,
    breakdown: source.breakdown.map((lineItem) => ({
      ...lineItem,
      label: getLocalizedField(
        lineItem as unknown as Record<string, unknown>,
        "label",
        lang,
        lineItem.label
      ),
    })),
    timeline: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "timeline",
      lang,
      source.timeline
    ),
    notes: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "notes",
      lang,
      source.notes
    ),
  };
}

function mapProject(source: LocalizedProjectSource, lang: DemoLang): Project {
  return {
    ...source,
    title: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "title",
      lang,
      source.title
    ),
    description: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "description",
      lang,
      source.description
    ),
    category: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "category",
      lang,
      source.category
    ),
    location: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "location",
      lang,
      source.location
    ),
    budget: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "budget",
      lang,
      source.budget
    ),
    timeline: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "timeline",
      lang,
      source.timeline
    ),
    completionNote: source.completionNote
      ? getLocalizedField(
          source as unknown as Record<string, unknown>,
          "completionNote",
          lang,
          source.completionNote
        )
      : undefined,
    estimateDeposit: source.estimateDeposit
      ? { ...source.estimateDeposit }
      : undefined,
    quotes: source.quotes.map((quote) => mapQuote(quote, lang)),
  };
}

export function getInitialProjects(lang: DemoLang): Project[] {
  return PROJECT_SOURCES.map((source) => mapProject(source, lang));
}

export const INITIAL_PROJECTS: Project[] = getInitialProjects("en");
