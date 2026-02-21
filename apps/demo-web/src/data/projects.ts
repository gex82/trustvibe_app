import type { Project } from "../types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-bathroom",
    customerId: "user-maria",
    title: "Primary Bathroom Renovation",
    description:
      "Complete renovation of primary bathroom. Remove old tile, install new porcelain tile floor (12×24), replace vanity, install new shower with glass enclosure, repaint. All fixtures are customer-supplied. Bathroom is approx. 8×10 ft.",
    category: "Bathroom",
    location: "San Juan, PR",
    budget: "$2,500 – $3,500",
    timeline: "3–4 weeks",
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
    quotes: [
      {
        id: "quote-juan-bathroom",
        projectId: "proj-bathroom",
        contractorId: "user-juan",
        amount: 2800,
        breakdown: [
          { label: "Tile removal & disposal", amount: 350 },
          { label: "Floor tile installation (materials incl.)", amount: 800 },
          { label: "Shower enclosure installation", amount: 650 },
          { label: "Vanity installation", amount: 400 },
          { label: "Plumbing rough-in & fixtures", amount: 450 },
          { label: "Paint & finishing", amount: 150 },
        ],
        timeline: "3 weeks",
        notes:
          "I have completed 5 similar renovations this year in Santurce and Condado. All work guaranteed for 1 year. Start date flexible — can begin Monday.",
        status: "accepted",
        submittedAt: "2026-01-12",
      },
      {
        id: "quote-rosa-bathroom",
        projectId: "proj-bathroom",
        contractorId: "user-rosa",
        amount: 3100,
        breakdown: [
          { label: "Demolition & prep", amount: 400 },
          { label: "Tile work (floor + accent wall)", amount: 950 },
          { label: "Plumbing (full scope)", amount: 900 },
          { label: "Vanity + shower install", amount: 650 },
          { label: "Paint & cleanup", amount: 200 },
        ],
        timeline: "4 weeks",
        notes:
          "Premium materials available on request. Includes 1-year warranty on all plumbing work. I can accommodate a weekend start.",
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
    description:
      "Repair 3 cabinet doors that are off-hinges, refinish all upper cabinets (sand + repaint white). Replace all cabinet hardware (18 pulls). Kitchen is approximately 12×14 ft. Customer will supply hardware.",
    category: "Kitchen",
    location: "San Juan, PR",
    budget: "$400 – $600",
    timeline: "1 week",
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
          { label: "Cabinet door repair (3 doors)", amount: 150 },
          { label: "Sanding & priming all uppers", amount: 100 },
          { label: "Painting (2 coats, white)", amount: 150 },
          { label: "Hardware installation (labor)", amount: 50 },
        ],
        timeline: "4–5 days",
        notes:
          "I can start next week Monday. Paint color to be selected by customer — I recommend Benjamin Moore Chantilly Lace for a crisp white.",
        status: "pending",
        submittedAt: "2026-02-05",
      },
    ],
  },
  {
    id: "proj-exterior-paint",
    customerId: "user-other-1",
    title: "Exterior House Painting",
    description:
      "Full exterior repaint of 2-story single-family home. Approx. 2,400 sq ft exterior surface. Power wash first. Customer-selected colors. Includes trim and fascia.",
    category: "Painting",
    location: "Bayamón, PR",
    budget: "$3,000 – $5,000",
    timeline: "2 weeks",
    status: "open",
    createdAt: "2026-02-10",
    photos: ["/images/jobs/exterior-painting.png"],
    quotes: [],
  },
  {
    id: "proj-solar",
    customerId: "user-other-2",
    title: "Solar Panel Installation (8 Panels)",
    description:
      "Install 8 residential solar panels (320W each, total 2.56 kW system) on south-facing roof. Includes mounting hardware, inverter, charge controller, and connection to main electrical panel. Permit filing and PREPA net metering application included. Home is a 1,500 sq ft single-family residence in Caguas.",
    category: "Electrical",
    location: "Caguas, PR",
    budget: "$6,000 – $9,000",
    timeline: "3–5 days",
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
          { label: "Solar panels (8× 320W panels)", amount: 3200 },
          { label: "Inverter & charge controller", amount: 1400 },
          { label: "Roof mounting hardware & racking", amount: 800 },
          { label: "Electrical panel connection & wiring", amount: 1200 },
          { label: "Permit filing & PREPA net metering", amount: 600 },
        ],
        timeline: "4 days",
        notes:
          "I am NABCEP-certified and have completed 14 residential solar installs across Puerto Rico this year. All permits included. Net metering paperwork submitted to PREPA on your behalf. System comes with 25-year panel warranty and 10-year workmanship guarantee.",
        status: "pending",
        submittedAt: "2026-02-14",
      },
    ],
  },
];
