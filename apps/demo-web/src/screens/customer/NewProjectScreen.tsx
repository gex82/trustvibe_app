import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import { findUserById } from "../../data/users";
import type { Contractor } from "../../types";

const CATEGORY_OPTIONS = [
  { value: "Bathroom", key: "category.bathroom" },
  { value: "Kitchen", key: "category.kitchen" },
  { value: "Painting", key: "category.painting" },
  { value: "HVAC", key: "category.hvac" },
  { value: "Electrical", key: "category.electrical" },
  { value: "Plumbing", key: "category.plumbing" },
  { value: "Carpentry", key: "category.carpentry" },
  { value: "Tiling", key: "category.tiling" },
  { value: "Roofing", key: "category.roofing" },
  { value: "Other", key: "category.other" },
];

const TIMELINE_OPTIONS = [
  { value: "1-3 days", key: "newProject.timelineOption1to3Days" },
  { value: "1 week", key: "newProject.timelineOption1Week" },
  { value: "2 weeks", key: "newProject.timelineOption2Weeks" },
  { value: "3-4 weeks", key: "newProject.timelineOption3to4Weeks" },
  { value: "1-2 months", key: "newProject.timelineOption1to2Months" },
  { value: "Flexible", key: "newProject.timelineOptionFlexible" },
];

export default function NewProjectScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addProject } = useProjects();
  const { currentUser } = useAuth();
  const { t, lang } = useApp();

  const prelinkedContractor = searchParams.get("contractor");
  const linkedContractor = useMemo<Contractor | null>(() => {
    if (!prelinkedContractor) {
      return null;
    }
    const user = findUserById(prelinkedContractor, lang);
    if (!user || user.role !== "contractor") {
      return null;
    }
    return user as Contractor;
  }, [lang, prelinkedContractor]);
  const hasInvalidContractorQuery = Boolean(prelinkedContractor && !linkedContractor);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bathroom");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("2 weeks");
  const [location, setLocation] = useState(currentUser?.location ?? "San Juan, PR");
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const newId = await addProject({
        customerId: currentUser.id,
        contractorId: linkedContractor?.id,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        budget: budget.trim() || t("newProject.budgetPlaceholder"),
        timeline,
        photos: [],
      });
      setLoading(false);
      setSuccessId(newId);
    } catch {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("newProject.title")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-gray-900 mb-1">{t("newProject.success")}</h2>
            <p className="text-gray-500 text-[14px] leading-relaxed">{t("newProject.successSub")}</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={() => navigate(`/project/${successId}`)}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-2xl text-[15px] pressable"
            >
              {t("newProject.viewProject")}
            </button>
            <button
              onClick={() => navigate("/projects")}
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl text-[14px] pressable"
            >
              {t("newProject.viewAll")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("newProject.title")} back />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {linkedContractor && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
            <CheckCircle size={15} className="text-teal-600 flex-shrink-0" />
            <div data-testid="new-project-linked-contractor-card">
              <p
                data-testid="new-project-linked-contractor-business"
                className="text-teal-700 text-[12px] font-semibold"
              >
                {linkedContractor.businessName}
              </p>
              <p
                data-testid="new-project-linked-contractor-person"
                className="text-teal-700 text-[11px]"
              >
                {linkedContractor.name}
              </p>
              <p className="text-teal-700 text-[11px] mt-0.5">
                {t("newProject.linkedContractorLocked")}
              </p>
            </div>
          </div>
        )}
        {hasInvalidContractorQuery && (
          <div
            data-testid="new-project-invalid-contractor"
            className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4"
          >
            <p className="text-amber-700 text-[12px] font-semibold">
              {t("newProject.invalidContractorWarning")}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.projectTitle")} *
            </label>
            <input
              data-testid="new-project-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("newProject.titlePlaceholder")}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.category")} *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white appearance-none"
              >
                {CATEGORY_OPTIONS.map((categoryOption) => (
                  <option key={categoryOption.value} value={categoryOption.value}>
                    {t(categoryOption.key)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.description")} *
            </label>
            <textarea
              data-testid="new-project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("newProject.descriptionPlaceholder")}
              required
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white resize-none"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.budget")}
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t("newProject.budgetPlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.timeline")}
            </label>
            <div className="relative">
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white appearance-none"
              >
                {TIMELINE_OPTIONS.map((timelineOption) => (
                  <option key={timelineOption.value} value={timelineOption.value}>
                    {t(timelineOption.key)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.location")}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("newProject.locationPlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            />
          </div>

          {/* Submit */}
          <button
            data-testid="new-project-submit"
            type="submit"
            disabled={loading || !title.trim() || !description.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-[15px] transition pressable disabled:opacity-60 mt-1"
          >
            {loading ? t("newProject.posting") : t("newProject.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
