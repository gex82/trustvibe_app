import { describe, expect, it } from "vitest";
import { mapProjectDetailResponse, mapProjectRecordToDemoProject } from "../projects";
import { mapMessagesToThread } from "../messages";
import { mapLocalizedReviewToReview } from "../reviews";

describe("localized adapter mappings", () => {
  it("maps project and quote fields in Spanish mode", () => {
    const mapped = mapProjectRecordToDemoProject(
      {
        id: "proj-1",
        customerId: "customer-1",
        title: "Base title",
        titleEn: "English title",
        titleEs: "Titulo en espanol",
        description: "Base description",
        descriptionEn: "English description",
        descriptionEs: "Descripcion en espanol",
        category: "bathroom",
        municipality: "San Juan, PR",
        budgetMinCents: 250000,
        budgetMaxCents: 350000,
        desiredTimeline: "2 semanas",
        escrowState: "OPEN_FOR_QUOTES",
        createdAt: "2026-02-01",
        photos: [],
        selectedQuoteId: "quote-1",
        selectedQuotePriceCents: 280000,
      } as any,
      [
        {
          id: "quote-1",
          projectId: "proj-1",
          contractorId: "contractor-1",
          priceCents: 280000,
          lineItems: [{ description: "Trabajo", amountCents: 280000 }],
          timelineDays: 5,
          scopeNotes: "Notas",
          status: "SUBMITTED",
          createdAt: "2026-02-01",
        } as any,
      ],
      "es"
    );

    expect(mapped.title).toBe("Titulo en espanol");
    expect(mapped.description).toBe("Descripcion en espanol");
    expect(mapped.quotes[0]?.timeline).toBe("5 días");
  });

  it("maps message body by language", () => {
    const thread = mapMessagesToThread(
      "proj-1",
      "Proyecto",
      ["user-a", "user-b"],
      [
        {
          id: "msg-1",
          projectId: "proj-1",
          senderId: "user-a",
          body: "Base",
          bodyEn: "Hello",
          bodyEs: "Hola",
          createdAt: "2026-02-01T10:00:00.000Z",
        } as any,
      ],
      "es"
    );

    expect(thread.messages[0]?.text).toBe("Hola");
  });

  it("maps review text and tags by language", () => {
    const review = mapLocalizedReviewToReview(
      {
        id: "rev-1",
        projectId: "proj-1",
        fromUserId: "user-a",
        toUserId: "user-b",
        rating: 5,
        tags: ["On Time"],
        tagsEn: ["On Time"],
        tagsEs: ["A Tiempo"],
        text: "Base",
        textEn: "Great work",
        textEs: "Excelente trabajo",
        createdAt: "2026-02-01",
        fromName: "Maria",
      },
      "es"
    );

    expect(review.text).toBe("Excelente trabajo");
    expect(review.tags).toEqual(["A Tiempo"]);
  });

  it("maps estimate deposit from getProject detail response", () => {
    const mapped = mapProjectDetailResponse(
      {
        project: {
          id: "proj-1",
          customerId: "customer-1",
          title: "Base title",
          description: "Base description",
          category: "bathroom",
          municipality: "San Juan, PR",
          desiredTimeline: "3 weeks",
          escrowState: "OPEN_FOR_QUOTES",
          createdAt: "2026-02-01",
          photos: [],
        },
        quotes: [],
        estimateDeposit: {
          id: "dep-1",
          projectId: "proj-1",
          customerId: "customer-1",
          contractorId: "contractor-1",
          category: "general",
          amountCents: 3900,
          currency: "USD",
          status: "CREATED",
          createdAt: "2026-02-01T10:00:00.000Z",
          updatedAt: "2026-02-01T10:00:00.000Z",
          schemaVersion: 1,
          updatedBy: "tester",
        },
      } as any,
      "en"
    );

    expect(mapped.estimateDeposit?.id).toBe("dep-1");
    expect(mapped.estimateDeposit?.amountCents).toBe(3900);
    expect(mapped.estimateDeposit?.status).toBe("CREATED");
  });
});
