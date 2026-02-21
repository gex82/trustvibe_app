import type { Review } from "../types";
import type { LocalizedReviewSource } from "../types/localized";
import { mapLocalizedReviews } from "../adapters/reviews";
import type { DemoLang } from "../utils/localization";

export const REVIEW_SOURCES: LocalizedReviewSource[] = [
  {
    id: "rev-1",
    projectId: "proj-sample-1",
    fromUserId: "user-cust-1",
    toUserId: "user-juan",
    rating: 5,
    tags: ["On Time", "Clean Work", "Communicative", "Fair Price"],
    tagsEn: ["On Time", "Clean Work", "Communicative", "Fair Price"],
    tagsEs: ["A Tiempo", "Trabajo Limpio", "Comunicativo", "Precio Justo"],
    text: "Juan did an outstanding job on our master bathroom. He was punctual every single day, kept the area spotless, and communicated every step of the process. The tile work is flawless. Highly recommend!",
    textEn:
      "Juan did an outstanding job on our master bathroom. He was punctual every single day, kept the area spotless, and communicated every step of the process. The tile work is flawless. Highly recommend!",
    textEs:
      "Juan hizo un trabajo excelente en nuestro baño principal. Fue puntual todos los días, mantuvo el área limpia y comunicó cada paso del proceso. El trabajo de losa quedó impecable. Muy recomendado.",
    createdAt: "2025-12-15",
    fromName: "Sofia L.",
  },
  {
    id: "rev-2",
    projectId: "proj-sample-2",
    fromUserId: "user-cust-2",
    toUserId: "user-juan",
    rating: 5,
    tags: ["Professional", "Quality Work", "On Time", "Would Hire Again"],
    tagsEn: ["Professional", "Quality Work", "On Time", "Would Hire Again"],
    tagsEs: ["Profesional", "Trabajo de Calidad", "A Tiempo", "Lo Contrataría de Nuevo"],
    text: "Fixed a major plumbing leak quickly and affordably. Juan explained exactly what was wrong and what he was doing to fix it. Zero surprises, zero mess. Will absolutely hire again.",
    textEn:
      "Fixed a major plumbing leak quickly and affordably. Juan explained exactly what was wrong and what he was doing to fix it. Zero surprises, zero mess. Will absolutely hire again.",
    textEs:
      "Arregló una fuga mayor de plomería de forma rápida y económica. Juan explicó exactamente qué ocurría y cómo lo corregiría. Sin sorpresas y sin desorden. Definitivamente lo contrataría otra vez.",
    createdAt: "2025-11-20",
    fromName: "Roberto M.",
  },
  {
    id: "rev-3",
    projectId: "proj-sample-3",
    fromUserId: "user-cust-3",
    toUserId: "user-juan",
    rating: 4,
    tags: ["Quality Work", "Fair Price", "Communicative"],
    tagsEn: ["Quality Work", "Fair Price", "Communicative"],
    tagsEs: ["Trabajo de Calidad", "Precio Justo", "Comunicativo"],
    text: "Good work overall. Took one extra day due to a supplier delay on the shower fixtures, but Juan communicated promptly about it. Final result looks excellent — very happy with the tile.",
    textEn:
      "Good work overall. Took one extra day due to a supplier delay on the shower fixtures, but Juan communicated promptly about it. Final result looks excellent and we are very happy with the tile.",
    textEs:
      "Buen trabajo en general. Tomó un día adicional por demora del suplidor en accesorios de ducha, pero Juan lo comunicó a tiempo. El resultado final quedó excelente y estamos muy satisfechos con la losa.",
    createdAt: "2025-10-08",
    fromName: "Carmen V.",
  },
  {
    id: "rev-4",
    projectId: "proj-sample-4",
    fromUserId: "user-cust-4",
    toUserId: "user-juan",
    rating: 5,
    tags: ["On Time", "Clean Work", "Professional"],
    tagsEn: ["On Time", "Clean Work", "Professional"],
    tagsEs: ["A Tiempo", "Trabajo Limpio", "Profesional"],
    text: "Hired Juan for a full guest bathroom remodel. Everything from demo to final caulk was done perfectly. He even noticed a small pipe issue behind the wall and fixed it proactively. A true professional.",
    textEn:
      "Hired Juan for a full guest bathroom remodel. Everything from demo to final caulk was done perfectly. He even noticed a small pipe issue behind the wall and fixed it proactively. A true professional.",
    textEs:
      "Contratamos a Juan para remodelar completo el baño de visitas. Todo, desde la demolición hasta el sellado final, quedó perfecto. Incluso detectó una tubería con problema detrás de la pared y la corrigió proactivamente. Un verdadero profesional.",
    createdAt: "2025-09-01",
    fromName: "Andres P.",
  },
];

export function getReviews(lang: DemoLang): Review[] {
  return mapLocalizedReviews(REVIEW_SOURCES, lang);
}

export const REVIEWS: Review[] = getReviews("en");
