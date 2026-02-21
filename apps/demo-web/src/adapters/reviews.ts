import type { Review } from "../types";
import type { LocalizedReviewSource } from "../types/localized";
import { getLocalizedField, type DemoLang } from "../utils/localization";

export function mapLocalizedReviewToReview(
  source: LocalizedReviewSource,
  lang: DemoLang
): Review {
  const tags =
    lang === "es"
      ? source.tagsEs ?? source.tags
      : source.tagsEn ?? source.tags;

  return {
    ...source,
    text: getLocalizedField(
      source as unknown as Record<string, unknown>,
      "text",
      lang,
      source.text
    ),
    tags,
  };
}

export function mapLocalizedReviews(
  sources: LocalizedReviewSource[],
  lang: DemoLang
): Review[] {
  return sources.map((source) => mapLocalizedReviewToReview(source, lang));
}
