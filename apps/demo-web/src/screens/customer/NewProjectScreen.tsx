import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";

const CATEGORIES = [
  "Bathroom",
  "Kitchen",
  "Painting",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Carpentry",
  "Tiling",
  "Roofing",
  "Other",
];

const TIMELINES = [
  "1–3 days",
  "1 week",
  "2 weeks",
  "3–4 weeks",
  "1–2 months",
  "Flexible",
];

export default function NewProjectScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addProject } = useProjects();
  const { currentUser } = useAuth();
  const { t } = useApp();

  const prelinkedContractor = searchParams.get("contractor");

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
        {prelinkedContractor && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
            <CheckCircle size={15} className="text-teal-600 flex-shrink-0" />
            <p className="text-teal-700 text-[12px] font-semibold">{t("newProject.contractorLinked")}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("newProject.projectTitle")} *
            </label>
            <input
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
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
                {TIMELINES.map((tl) => (
                  <option key={tl} value={tl}>{tl}</option>
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
              placeholder="San Juan, PR"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
            />
          </div>

          {/* Submit */}
          <button
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
