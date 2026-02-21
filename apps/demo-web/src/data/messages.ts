import type { Message, MessageThread } from "../types";
import type { LocalizedThreadSource } from "../types/localized";
import { getLocalizedField, type DemoLang } from "../utils/localization";

export const THREAD_SOURCES: LocalizedThreadSource[] = [
  {
    id: "thread-bathroom",
    participants: ["user-maria", "user-juan"],
    projectId: "proj-bathroom",
    projectTitle: "Primary Bathroom Renovation",
    projectTitleEn: "Primary Bathroom Renovation",
    projectTitleEs: "Remodelación de Baño Principal",
    messages: [
      {
        id: "msg-1",
        threadId: "thread-bathroom",
        senderId: "user-juan",
        text: "Hola Maria! I reviewed your bathroom project and I'm very interested. I've done several similar renovations in Santurce and Condado. When would be a good time to do a site visit?",
        textEn:
          "Hi Maria! I reviewed your bathroom project and I'm very interested. I've done several similar renovations in Santurce and Condado. When would be a good time for a site visit?",
        textEs:
          "¡Hola María! Revisé tu proyecto de baño y me interesa mucho. He hecho renovaciones similares en Santurce y Condado. ¿Cuándo te viene bien una visita al lugar?",
        timestamp: "2026-01-11T10:00:00",
        read: true,
      },
      {
        id: "msg-2",
        threadId: "thread-bathroom",
        senderId: "user-maria",
        text: "Hi Juan! Yes, would Tuesday afternoon work for you? Between 2–5 PM?",
        textEn:
          "Hi Juan! Yes, would Tuesday afternoon work for you? Between 2–5 PM?",
        textEs:
          "¡Hola Juan! Sí, ¿te funciona el martes en la tarde? ¿Entre 2 y 5 PM?",
        timestamp: "2026-01-11T14:22:00",
        read: true,
      },
      {
        id: "msg-3",
        threadId: "thread-bathroom",
        senderId: "user-juan",
        text: "Tuesday at 3pm works perfectly. I'll bring samples of the tile options so you can see them in person. What's the address?",
        textEn:
          "Tuesday at 3pm works perfectly. I'll bring tile samples so you can see options in person. What's the address?",
        textEs:
          "El martes a las 3pm me viene perfecto. Llevaré muestras de losas para que veas opciones en persona. ¿Cuál es la dirección?",
        timestamp: "2026-01-11T14:45:00",
        read: true,
      },
      {
        id: "msg-4",
        threadId: "thread-bathroom",
        senderId: "user-maria",
        text: "Great! 42 Calle Luna, Apt 3B, San Juan. See you then! The door code is #1842.",
        textEn:
          "Great! 42 Calle Luna, Apt 3B, San Juan. See you then! The door code is #1842.",
        textEs:
          "¡Perfecto! 42 Calle Luna, Apt 3B, San Juan. ¡Nos vemos! El código de la puerta es #1842.",
        timestamp: "2026-01-11T15:00:00",
        read: true,
      },
      {
        id: "msg-5",
        threadId: "thread-bathroom",
        senderId: "user-juan",
        text: "Work is going great! Tile floor is 100% done — it looks stunning. Starting on the shower enclosure tomorrow morning. Sending photos to the project shortly.",
        textEn:
          "Work is going great! Tile floor is 100% done and looks great. I start the shower enclosure tomorrow morning and will send photos shortly.",
        textEs:
          "¡El trabajo va excelente! El piso en losa está 100% completado y quedó espectacular. Mañana empiezo la mampara de ducha y te envío fotos en breve.",
        timestamp: "2026-02-01T09:15:00",
        read: true,
      },
      {
        id: "msg-6",
        threadId: "thread-bathroom",
        senderId: "user-maria",
        text: "It looks amazing from the photos! The tile color is exactly what I imagined. How many more days until everything is finished?",
        textEn:
          "It looks amazing in the photos! The tile color is exactly what I imagined. How many more days until everything is done?",
        textEs:
          "¡Se ve increíble en las fotos! El color de la losa es justo lo que imaginé. ¿Cuántos días más faltan para terminar?",
        timestamp: "2026-02-01T11:30:00",
        read: true,
      },
      {
        id: "msg-7",
        threadId: "thread-bathroom",
        senderId: "user-juan",
        text: "About 2–3 more days for the vanity and final plumbing. I'll submit for completion once the final inspection is done. Thank you for being such a great client — this has been a pleasure! 🙏",
        textEn:
          "About 2–3 more days for the vanity and final plumbing. I'll request completion after final inspection. Thank you for being a great client! 🙏",
        textEs:
          "Aproximadamente 2–3 días más para el vanity y la plomería final. Solicitaré finalización luego de la inspección. ¡Gracias por ser tan buena clienta! 🙏",
        timestamp: "2026-02-01T12:05:00",
        read: false,
      },
    ],
  },
  {
    id: "thread-solar",
    participants: ["user-other-2", "user-carlos"],
    projectId: "proj-solar",
    projectTitle: "Solar Panel Installation (8 Panels)",
    projectTitleEn: "Solar Panel Installation (8 Panels)",
    projectTitleEs: "Instalación de Paneles Solares (8 Paneles)",
    messages: [
      {
        id: "solar-msg-1",
        threadId: "thread-solar",
        senderId: "user-carlos",
        text: "Hello! I reviewed your solar project and I'm very interested. I'm NABCEP-certified and have completed 14 residential installs across Puerto Rico this year. I can have your 8-panel system up in 4 days. When can I schedule a site visit?",
        textEn:
          "Hello! I reviewed your solar project and I'm very interested. I'm NABCEP-certified and completed 14 residential installs in Puerto Rico this year. I can install your 8-panel system in 4 days. When can I schedule a site visit?",
        textEs:
          "¡Hola! Revisé tu proyecto solar y estoy muy interesado. Estoy certificado por NABCEP y completé 14 instalaciones residenciales en Puerto Rico este año. Puedo instalar tu sistema de 8 paneles en 4 días. ¿Cuándo puedo coordinar una visita?",
        timestamp: "2026-02-14T09:30:00",
        read: true,
      },
      {
        id: "solar-msg-2",
        threadId: "thread-solar",
        senderId: "user-other-2",
        text: "Hi Carlos! Sounds great. Thursday at 10am works for me. Address is 88 Calle Colón, Caguas.",
        textEn:
          "Hi Carlos! Sounds great. Thursday at 10am works for me. Address is 88 Calle Colón, Caguas.",
        textEs:
          "¡Hola Carlos! Suena muy bien. El jueves a las 10am me funciona. La dirección es 88 Calle Colón, Caguas.",
        timestamp: "2026-02-14T11:15:00",
        read: true,
      },
      {
        id: "solar-msg-3",
        threadId: "thread-solar",
        senderId: "user-carlos",
        text: "Perfect, I'll be there Thursday at 10am. I'll assess the roof angle, shading, and panel placement. I'll also bring sample specs for the 320W panels. My quote includes all permits and the PREPA net metering application — you don't have to deal with any paperwork.",
        textEn:
          "Perfect, I'll be there Thursday at 10am. I'll assess roof angle, shading, and panel placement. My quote includes permits and PREPA net metering paperwork.",
        textEs:
          "Perfecto, estaré allí el jueves a las 10am. Evaluaré el ángulo del techo, sombras y ubicación de paneles. Mi cotización incluye permisos y el trámite de medición neta con PREPA.",
        timestamp: "2026-02-14T11:45:00",
        read: true,
      },
      {
        id: "solar-msg-4",
        threadId: "thread-solar",
        senderId: "user-other-2",
        text: "Excellent! One question — how long until we start seeing savings on the electric bill?",
        textEn:
          "Excellent! One question: how long until we start seeing savings on the electric bill?",
        textEs:
          "¡Excelente! Una pregunta: ¿cuánto tarda en reflejarse el ahorro en la factura eléctrica?",
        timestamp: "2026-02-14T12:00:00",
        read: true,
      },
      {
        id: "solar-msg-5",
        threadId: "thread-solar",
        senderId: "user-carlos",
        text: "With a 2.56 kW system and Puerto Rico's average sun hours, you can expect to offset 60–80% of your monthly electric bill. Most of my clients see full payback in 4–6 years. I'll bring a savings estimate for your specific address on Thursday. 🌞",
        textEn:
          "With a 2.56 kW system and Puerto Rico's average sun hours, you can offset 60–80% of your monthly bill. Most clients see full payback in 4–6 years. I'll bring a tailored estimate Thursday. 🌞",
        textEs:
          "Con un sistema de 2.56 kW y las horas de sol promedio en Puerto Rico, puedes compensar 60–80% de tu factura mensual. La mayoría de clientes recupera la inversión en 4–6 años. Llevaré un estimado para tu dirección el jueves. 🌞",
        timestamp: "2026-02-14T12:20:00",
        read: false,
      },
    ],
  },
];

function mapMessage(
  message: LocalizedThreadSource["messages"][number],
  lang: DemoLang
): Message {
  return {
    ...message,
    text: getLocalizedField(
      message as unknown as Record<string, unknown>,
      "text",
      lang,
      message.text
    ),
  };
}

function mapThread(source: LocalizedThreadSource, lang: DemoLang): MessageThread {
  return {
    ...source,
    projectTitle: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "projectTitle",
      lang,
      source.projectTitle
    ),
    messages: source.messages.map((message) => mapMessage(message, lang)),
  };
}

export function getInitialThreads(lang: DemoLang): MessageThread[] {
  return THREAD_SOURCES.map((source) => mapThread(source, lang));
}

export const INITIAL_THREADS: MessageThread[] = getInitialThreads("en");
