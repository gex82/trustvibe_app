import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MapPin, Clock, Plus, Trash2, CheckCircle } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/formatters";
import type { LineItem } from "../../types";

export default function ProjectBidScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, submitQuote } = useProjects();
  const { currentUser } = useAuth();
  const { t } = useApp();

  const project = getProject(id ?? "");
  const [amount, setAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { label: "", amount: 0 },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const existingQuote = project?.quotes.find(
    (q) => q.contractorId === currentUser?.id
  );

  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title={t("bid.title")} back />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          {t("bid.notFound")}
        </div>
      </div>
    );
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { label: "", amount: 0 }]);
  };

  const removeLineItem = (i: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== i));
  };

  const updateLineItem = (i: number, field: keyof LineItem, value: string) => {
    setLineItems(
      lineItems.map((item, idx) =>
        idx === i
          ? { ...item, [field]: field === "amount" ? parseFloat(value) || 0 : value }
          : item
      )
    );
  };

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (!currentUser || !amount) return;
    await submitQuote(project.id, {
      projectId: project.id,
      contractorId: currentUser.id,
      amount: parseFloat(amount),
      breakdown: lineItems.filter((l) => l.label && l.amount > 0),
      timeline,
      notes,
      status: "pending",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("bid.successTitle")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6 scale-in">
            <CheckCircle size={40} className="text-teal-600" />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">{t("bid.successTitle")}</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed mb-6 max-w-xs">
            {t("bid.successSub")} <strong>{project.title}</strong> {t("bid.successSub2")}
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl pressable"
          >
            {t("bid.browseMore")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("bid.title")} back />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Project summary */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          {project.photos[0] && (
            <img src={project.photos[0]} alt="" className="w-full h-36 object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h2 className="font-extrabold text-gray-900 text-[16px] leading-tight flex-1">
                {project.title}
              </h2>
              <Badge status={project.status} size="xs" className="ml-2 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-gray-400">
                <MapPin size={11} />
                <span className="text-[11px]">{project.location}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={11} />
                <span className="text-[11px]">{project.timeline}</span>
              </div>
            </div>
            <p className="text-gray-500 text-[12px] mt-2 leading-relaxed">
              {project.description}
            </p>
            <p className="text-teal-700 font-bold text-[13px] mt-2">
              {t("projects.budget")}: {project.budget}
            </p>
          </div>
        </div>

        {/* If already quoted */}
        {existingQuote && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-800 font-bold text-[14px]">{t("bid.alreadyQuoted")}</p>
            <p className="text-amber-600 text-[12px] mt-1">
              {t("bid.alreadyQuotedSub")} {formatCurrency(existingQuote.amount)} · {t("bid.timeline")} {existingQuote.timeline}
            </p>
          </div>
        )}

        {/* Quote form — only if not yet quoted */}
        {!existingQuote && (
          <>
            {/* Total amount */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                {t("bid.amount")}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px]">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 rounded-xl pl-8 pr-4 py-3 text-[20px] font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
            </div>

            {/* Line items */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("bid.breakdown")}
                </p>
                <button
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-teal-600 text-[11px] font-semibold pressable"
                >
                  <Plus size={13} />
                  {t("bid.addItem")}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateLineItem(i, "label", e.target.value)}
                      placeholder={t("bid.itemPlaceholder")}
                      className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">
                        $
                      </span>
                      <input
                        type="number"
                        value={item.amount || ""}
                        onChange={(e) => updateLineItem(i, "amount", e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50 rounded-xl pl-5 pr-2 py-2 text-[12px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(i)}
                        className="text-gray-300 hover:text-red-400 pressable"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="border-t border-gray-100 mt-3 pt-2 flex items-center justify-between">
                  <span className="text-[12px] text-gray-500 font-medium">{t("bid.breakdownTotal")}</span>
                  <span className="text-[14px] font-extrabold text-gray-800">
                    {formatCurrency(total)}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                {t("bid.timelineLabel")}
              </p>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder={t("bid.timelinePlaceholder")}
                className="w-full bg-gray-50 rounded-xl px-3 py-3 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>

            {/* Notes */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                {t("bid.notes")}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("bid.notesPlaceholder")}
                rows={3}
                maxLength={400}
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              />
              <p className="text-[10px] text-gray-400 text-right">{notes.length}/400</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl text-[15px] pressable disabled:opacity-40"
            >
              {t("bid.submitBtn")} {amount ? formatCurrency(parseFloat(amount)) : "$0"}
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed pb-2">
              {t("bid.terms")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
