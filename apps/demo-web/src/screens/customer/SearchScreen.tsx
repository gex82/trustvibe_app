import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, CheckCircle, ChevronRight, Zap } from "lucide-react";
import { findUserById, getContractors } from "../../data/users";
import { useApp } from "../../context/AppContext";
import { useRuntime } from "../../context/RuntimeContext";
import type { Contractor } from "../../types";
import TopBar from "../../components/layout/TopBar";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";
import { getRecommendations } from "../../services/api";

export default function SearchScreen() {
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const { dataMode } = useRuntime();
  const [query, setQuery] = useState("");
  const [liveContractors, setLiveContractors] = useState<Contractor[] | null>(null);
  const [filters, setFilters] = useState<{
    category?: string;
    municipality?: string;
    minRating?: number;
  }>({});

  const CATEGORIES = [
    { key: "plumbing", label: t("category.plumbing"), terms: ["plumbing", t("category.plumbing")] },
    { key: "electrical", label: t("category.electrical"), terms: ["electrical", t("category.electrical")] },
    { key: "painting", label: t("category.painting"), terms: ["painting", t("category.painting")] },
    { key: "hvac", label: t("category.hvac"), terms: ["hvac", t("category.hvac")] },
    { key: "carpentry", label: t("category.carpentry"), terms: ["carpentry", t("category.carpentry")] },
    { key: "tiling", label: t("category.tiling"), terms: ["tiling", t("category.tiling")] },
  ];
  const MUNICIPALITIES = ["San Juan", "Bayamon", "Carolina", "Ponce", "Caguas"];
  const RATING_FILTERS = [4, 3];

  useEffect(() => {
    if (dataMode !== "live") {
      setLiveContractors(null);
      return;
    }

    let mounted = true;
    void (async () => {
      try {
        const result = await getRecommendations({ target: "customer", limit: 20 });
        if (!mounted) return;

        const mapped = result.recommendations
          .filter((item) => item.type === "contractor")
          .map((item, index) => {
            const meta = item as any;
            const matched = item.contractorId
              ? (findUserById(item.contractorId, lang) as Contractor | null)
              : null;
            if (matched) {
              return matched;
            }
            const id = item.contractorId ?? `live-contractor-${index}`;
            const fallbackName = t("search.recommendedContractor");
            return {
              id,
              email: `${id}@trustvibe.test`,
              password: "",
              role: "contractor" as const,
              name: meta.contractorName ?? fallbackName,
              businessName: meta.contractorName ?? fallbackName,
              avatarUrl:
                meta.contractorAvatarUrl ?? "/images/contractors/juan-reyes.png",
              location: "Puerto Rico",
              memberSince: "2026-01",
              verified: true,
              specialty: [t("search.generalSpecialty")],
              rating: meta.contractorRatingAvg ?? 4.7,
              reviewCount: meta.contractorReviewCount ?? 12,
              completedJobs: 8,
              bio: t("search.recommendedBio"),
              portfolioImages: [],
              insuranceVerified: true,
              responseTime: lang === "es" ? "< 2 horas" : "< 2 hours",
              badges: [t("search.recommendedBadge")],
            };
          });
        setLiveContractors(mapped);
      } catch {
        setLiveContractors(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dataMode, lang, t]);

  const contractors = liveContractors?.length ? liveContractors : getContractors(lang);
  const hasActiveFilters = Boolean(
    filters.category || filters.municipality || filters.minRating
  );

  const filtered = contractors.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.businessName.toLowerCase().includes(query.toLowerCase()) ||
      c.specialty.some((s) => s.toLowerCase().includes(query.toLowerCase()));

    const activeCategory = CATEGORIES.find((cat) => cat.key === filters.category);
    const matchesCategory =
      !activeCategory ||
      c.specialty.some((s) => {
        const lower = s.toLowerCase();
        return activeCategory.terms.some((term) =>
          lower.includes(term.toLowerCase())
        );
      });
    const matchesMunicipality =
      !filters.municipality ||
      (c.location ?? "").toLowerCase().includes(filters.municipality.toLowerCase());
    const matchesRating = !filters.minRating || c.rating >= filters.minRating;

    return matchesQuery && matchesCategory && matchesMunicipality && matchesRating;
  });

  const toggleCategory = (value: string) =>
    setFilters((current) => ({
      ...current,
      category: current.category === value ? undefined : value,
    }));

  const toggleMunicipality = (value: string) =>
    setFilters((current) => ({
      ...current,
      municipality: current.municipality === value ? undefined : value,
    }));

  const toggleRating = (value: number) =>
    setFilters((current) => ({
      ...current,
      minRating: current.minRating === value ? undefined : value,
    }));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("search.title")} />

      {/* Search bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            data-testid="search-query-input"
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-gray-100"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 py-3 overflow-y-auto scrollbar-none bg-white border-b border-gray-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-500 font-semibold uppercase">{t("search.filters")}</p>
          {hasActiveFilters ? (
            <button
              data-testid="search-clear-filters"
              className="text-teal-600 text-[11px] font-semibold"
              onClick={() => setFilters({})}
            >
              {t("search.clearFilters")}
            </button>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              data-testid={`search-filter-category-${cat.key}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition pressable ${
                filters.category === cat.key
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {MUNICIPALITIES.map((municipality) => (
            <button
              key={municipality}
              onClick={() => toggleMunicipality(municipality)}
              data-testid={`search-filter-municipality-${municipality}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition pressable ${
                filters.municipality === municipality
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {municipality}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {RATING_FILTERS.map((stars) => (
            <button
              key={stars}
              onClick={() => toggleRating(stars)}
              data-testid={`search-filter-rating-${stars}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition pressable ${
                filters.minRating === stars
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {stars}+ {t("search.starsSuffix")}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">{t("search.noResults")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("search.noResultsSub")}</p>
          </div>
        ) : (
          filtered.map((c) => (
            <ContractorCard
              key={c.id}
              contractor={c}
              onPress={() => navigate(`/contractor/${c.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ContractorCard({ contractor: c, onPress }: { contractor: Contractor; onPress: () => void }) {
  const { t } = useApp();
  return (
    <Card
      onClick={onPress}
      padding="none"
      shadow="sm"
      data-testid={`search-recommended-contractor-${c.id}`}
    >
      <div className="p-4 flex gap-3">
        <div className="relative flex-shrink-0">
          <Avatar src={c.avatarUrl} name={c.name} size="lg" />
          {c.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle size={11} className="text-white" fill="white" strokeWidth={0} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-[14px] truncate">{c.businessName}</h3>
              <p className="text-gray-500 text-[11px]">{c.name}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0 ml-2" />
          </div>

          {/* Rating & stats */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" fill="#fbbf24" />
              <span className="text-[12px] font-bold text-gray-800">{c.rating}</span>
              <span className="text-[11px] text-gray-400">({c.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin size={11} />
              <span className="text-[11px]">{c.location ?? "Puerto Rico"}</span>
            </div>
          </div>

          {/* Specialty tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {c.specialty.slice(0, 3).map((s) => (
              <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>

          {/* Response time & jobs */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-teal-600">
              <Zap size={11} />
              <span className="text-[10px] font-semibold">{c.responseTime}</span>
            </div>
            <span className="text-[10px] text-gray-400">{c.completedJobs} {t("search.jobsCompleted")}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      {c.badges.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap border-t border-gray-50 pt-2.5">
          {c.badges.map((b) => (
            <span key={b} className="text-[10px] text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5 font-semibold">
              {b}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
