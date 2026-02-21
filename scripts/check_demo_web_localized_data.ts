const { PROJECT_SOURCES } = require("../apps/demo-web/src/data/projects");
const { THREAD_SOURCES } = require("../apps/demo-web/src/data/messages");
const { REVIEW_SOURCES } = require("../apps/demo-web/src/data/reviews");
const { USER_SOURCES } = require("../apps/demo-web/src/data/users");
const { EARNINGS_SOURCES } = require("../apps/demo-web/src/data/earnings");

type Finding = {
  domain: string;
  id: string;
  field: string;
  issue: string;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasTextArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item: unknown) => hasText(item))
  );
}

function requireText(
  findings: Finding[],
  domain: string,
  id: string,
  source: Record<string, unknown>,
  field: string
): void {
  if (!hasText(source[field])) {
    findings.push({
      domain,
      id,
      field,
      issue: "Missing non-empty localized field",
    });
  }
}

function requireTextArray(
  findings: Finding[],
  domain: string,
  id: string,
  source: Record<string, unknown>,
  field: string
): void {
  if (!hasTextArray(source[field])) {
    findings.push({
      domain,
      id,
      field,
      issue: "Missing non-empty localized array field",
    });
  }
}

function checkProjects(findings: Finding[]): void {
  for (const project of PROJECT_SOURCES as Array<Record<string, unknown>>) {
    const id = String(project.id ?? "unknown-project");

    requireText(findings, "projects", id, project, "titleEn");
    requireText(findings, "projects", id, project, "titleEs");
    requireText(findings, "projects", id, project, "descriptionEn");
    requireText(findings, "projects", id, project, "descriptionEs");
    requireText(findings, "projects", id, project, "timelineEn");
    requireText(findings, "projects", id, project, "timelineEs");

    const quotes = Array.isArray(project.quotes)
      ? (project.quotes as Array<Record<string, unknown>>)
      : [];

    quotes.forEach((quote: Record<string, unknown>, index: number) => {
      const quoteId = String(quote.id ?? `${id}-quote-${index}`);
      requireText(findings, "projects.quotes", quoteId, quote, "timelineEn");
      requireText(findings, "projects.quotes", quoteId, quote, "timelineEs");
      requireText(findings, "projects.quotes", quoteId, quote, "notesEn");
      requireText(findings, "projects.quotes", quoteId, quote, "notesEs");

      const breakdown = Array.isArray(quote.breakdown)
        ? (quote.breakdown as Array<Record<string, unknown>>)
        : [];
      breakdown.forEach((lineItem: Record<string, unknown>, lineIndex: number) => {
        const lineItemId = `${quoteId}-line-${lineIndex}`;
        requireText(
          findings,
          "projects.quotes.breakdown",
          lineItemId,
          lineItem,
          "labelEn"
        );
        requireText(
          findings,
          "projects.quotes.breakdown",
          lineItemId,
          lineItem,
          "labelEs"
        );
      });
    });
  }
}

function checkMessages(findings: Finding[]): void {
  for (const thread of THREAD_SOURCES as Array<Record<string, unknown>>) {
    const id = String(thread.id ?? "unknown-thread");
    requireText(findings, "messages", id, thread, "projectTitleEn");
    requireText(findings, "messages", id, thread, "projectTitleEs");

    const messages = Array.isArray(thread.messages)
      ? (thread.messages as Array<Record<string, unknown>>)
      : [];
    messages.forEach((message: Record<string, unknown>, index: number) => {
      const messageId = String(message.id ?? `${id}-message-${index}`);
      requireText(findings, "messages.items", messageId, message, "textEn");
      requireText(findings, "messages.items", messageId, message, "textEs");
    });
  }
}

function checkReviews(findings: Finding[]): void {
  for (const review of REVIEW_SOURCES as Array<Record<string, unknown>>) {
    const id = String(review.id ?? "unknown-review");
    requireText(findings, "reviews", id, review, "textEn");
    requireText(findings, "reviews", id, review, "textEs");
    requireTextArray(findings, "reviews", id, review, "tagsEn");
    requireTextArray(findings, "reviews", id, review, "tagsEs");
  }
}

function checkUsers(findings: Finding[]): void {
  for (const user of USER_SOURCES as Array<Record<string, unknown>>) {
    if (user.role !== "contractor") {
      continue;
    }

    const id = String(user.id ?? "unknown-contractor");
    requireText(findings, "users.contractor", id, user, "businessNameEn");
    requireText(findings, "users.contractor", id, user, "businessNameEs");
    requireText(findings, "users.contractor", id, user, "bioEn");
    requireText(findings, "users.contractor", id, user, "bioEs");
    requireTextArray(findings, "users.contractor", id, user, "specialtyEn");
    requireTextArray(findings, "users.contractor", id, user, "specialtyEs");
    requireTextArray(findings, "users.contractor", id, user, "badgesEn");
    requireTextArray(findings, "users.contractor", id, user, "badgesEs");
    requireText(findings, "users.contractor", id, user, "responseTimeEn");
    requireText(findings, "users.contractor", id, user, "responseTimeEs");
  }
}

function checkEarnings(findings: Finding[]): void {
  for (const earning of EARNINGS_SOURCES as Array<Record<string, unknown>>) {
    const id = String(earning.id ?? "unknown-earning");
    requireText(findings, "earnings", id, earning, "projectTitleEn");
    requireText(findings, "earnings", id, earning, "projectTitleEs");
  }
}

function main(): void {
  const findings: Finding[] = [];

  checkProjects(findings);
  checkMessages(findings);
  checkReviews(findings);
  checkUsers(findings);
  checkEarnings(findings);

  if (!findings.length) {
    console.log("Demo-web localized data gate passed.");
    process.exit(0);
  }

  console.error(
    `Demo-web localized data gate failed with ${findings.length} finding(s).`
  );
  findings.forEach((finding, index) => {
    console.error(
      `${index + 1}. ${finding.domain} :: ${finding.id} :: ${finding.field} :: ${finding.issue}`
    );
  });
  process.exit(1);
}

main();
