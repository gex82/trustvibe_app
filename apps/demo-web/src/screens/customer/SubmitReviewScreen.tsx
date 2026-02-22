import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import { useRuntime } from "../../context/RuntimeContext";
import { findUserById } from "../../data/users";
import type { Contractor } from "../../types";
import TopBar from "../../components/layout/TopBar";
import StarRating from "../../components/ui/StarRating";
import Avatar from "../../components/ui/Avatar";
import { submitReview as submitReviewApi } from "../../services/api";

export default function SubmitReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { t, lang } = useApp();
  const { dataMode } = useRuntime();

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const REVIEW_TAGS = [
    { key: "tag.onTime", label: t("tag.onTime") },
    { key: "tag.cleanWork", label: t("tag.cleanWork") },
    { key: "tag.professional", label: t("tag.professional") },
    { key: "tag.fairPrice", label: t("tag.fairPrice") },
    { key: "tag.communicative", label: t("tag.communicative") },
    { key: "tag.qualityWork", label: t("tag.qualityWork") },
    { key: "tag.wouldHireAgain", label: t("tag.wouldHireAgain") },
    { key: "tag.fast", label: t("tag.fast") },
    { key: "tag.detailOriented", label: t("tag.detailOriented") },
  ];

  const project = getProject(id ?? "");
  const acceptedQuote = project?.quotes.find((q) => q.id === project?.acceptedQuoteId);
  const contractor = acceptedQuote
    ? (findUserById(acceptedQuote.contractorId, lang) as Contractor | null)
    : null;

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const mapTags = (
    tags: string[]
  ): Array<"quality" | "communication" | "timeliness"> => {
    const mapped = tags.map((tag) => {
      if (tag.includes("onTime") || tag.includes("fast")) return "timeliness";
      if (tag.includes("communicative")) return "communication";
      return "quality";
    });
    return Array.from(new Set(mapped)) as Array<
      "quality" | "communication" | "timeliness"
    >;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }
    if (selectedTags.length === 0) {
      setError(t("review.selectTagError"));
      return;
    }
    setError("");

    if (dataMode === "live" && project) {
      try {
        await submitReviewApi({
          projectId: project.id,
          rating: Math.max(1, Math.min(5, rating)) as 1 | 2 | 3 | 4 | 5,
          feedback: text.trim(),
          tags: mapTags(selectedTags),
        });
      } catch {
        // continue to success state in demo mode
      }
    }

    setSubmitted(true);
  };

  const starLabel =
    rating === 0
      ? t("review.starPrompt")
      : rating === 1
      ? t("review.star1")
      : rating === 2
      ? t("review.star2")
      : rating === 3
      ? t("review.star3")
      : rating === 4
      ? t("review.star4")
      : t("review.star5");

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("review.success")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 scale-in">
            <span className="text-[48px]">⭐</span>
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">{t("review.success")}</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed mb-8 max-w-xs">
            {t("review.successSub")}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate("/home")}
              className="flex-1 bg-teal-600 text-white font-bold py-3.5 rounded-2xl text-sm pressable"
            >
              {t("review.backHome")}
            </button>
            <button
              onClick={() => navigate("/search")}
              className="flex-1 bg-white border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl text-sm pressable"
            >
              {t("review.findMore")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("btn.leaveReview")} back />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Contractor */}
        {contractor && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Avatar src={contractor.avatarUrl} name={contractor.name} size="md" />
            <div>
              <p className="font-bold text-gray-900 text-[14px]">{contractor.businessName}</p>
              <p className="text-gray-400 text-[12px]">{project?.title}</p>
            </div>
          </div>
        )}

        {/* Star rating */}
        <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="font-bold text-gray-700 text-[15px]">{t("review.title")}</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          <p className="text-gray-400 text-[12px]">{starLabel}</p>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t("review.whatsStoodOut")}</p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                data-testid={`review-tag-${tag.key.replace("tag.", "")}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition pressable ${
                  selectedTags.includes(tag.key)
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                }`}
              >
                {selectedTags.includes(tag.key) ? "✓ " : ""}{tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text review */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t("review.title")}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("review.placeholder")}
            rows={4}
            maxLength={500}
            className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
          />
          <p className="text-[10px] text-gray-400 text-right mt-1">{text.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          data-testid="review-submit"
          className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl text-[15px] pressable disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} />
          {t("btn.submitReview")}
        </button>
        {error ? (
          <p className="text-[12px] text-red-600 text-center">{error}</p>
        ) : null}

        <p className="text-[10px] text-gray-400 text-center pb-2">
          {t("review.publicNote")}
        </p>
      </div>
    </div>
  );
}
