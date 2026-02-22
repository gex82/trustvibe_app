import { afterEach, describe, expect, it, vi } from "vitest";
import { formatCurrency, formatDate, formatRelative, formatTime } from "../formatters";

describe("formatters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats currency for both locales", () => {
    const en = formatCurrency(1234, "en-US");
    const es = formatCurrency(1234, "es-PR");

    expect(en).toContain("1,234");
    expect(es).toContain("1,234");
    expect(en).toContain("$");
    expect(es).toContain("$");
  });

  it("formats date and time with locale-sensitive output", () => {
    const dateIso = "2026-02-01T15:30:00.000Z";
    const enDate = formatDate(dateIso, "en-US");
    const esDate = formatDate(dateIso, "es-PR");

    expect(enDate).toMatch(/2026/);
    expect(esDate).toMatch(/2026/);
    expect(enDate).not.toBe(esDate);

    const enTime = formatTime(dateIso, "en-US");
    const esTime = formatTime(dateIso, "es-PR");

    expect(enTime.length).toBeGreaterThan(0);
    expect(esTime.length).toBeGreaterThan(0);
    expect(enTime).not.toBe(esTime);
  });

  it("formats relative time using locale text", () => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-02-01T16:00:00.000Z").getTime());

    const target = "2026-02-01T15:00:00.000Z";
    const en = formatRelative(target, "en-US").toLowerCase();
    const es = formatRelative(target, "es-PR").toLowerCase();

    expect(en).toMatch(/hour|ago/);
    expect(es).toMatch(/hora|hace/);
  });
});
