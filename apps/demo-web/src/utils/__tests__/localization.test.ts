import { describe, expect, it } from "vitest";
import { getLocalizedField, resolveLocale } from "../localization";

describe("localization utils", () => {
  it("returns locale mapping by language", () => {
    expect(resolveLocale("en")).toBe("en-US");
    expect(resolveLocale("es")).toBe("es-PR");
  });

  it("selects localized field by language with fallback order", () => {
    const record = {
      title: "Base",
      titleEn: "Hello",
      titleEs: "Hola",
    };

    expect(getLocalizedField(record, "title", "en", "Fallback")).toBe("Hello");
    expect(getLocalizedField(record, "title", "es", "Fallback")).toBe("Hola");
  });

  it("falls back to base, alternate language, then explicit fallback", () => {
    expect(
      getLocalizedField(
        {
          description: "Base description",
        },
        "description",
        "es",
        "Fallback"
      )
    ).toBe("Base description");

    expect(
      getLocalizedField(
        {
          descriptionEn: "English only",
        },
        "description",
        "es",
        "Fallback"
      )
    ).toBe("English only");

    expect(getLocalizedField({}, "description", "es", "Fallback")).toBe(
      "Fallback"
    );
  });
});
