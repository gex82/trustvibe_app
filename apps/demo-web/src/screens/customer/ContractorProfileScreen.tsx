import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, CheckCircle, Zap, Shield, Award, MessageCircle, ChevronLeft } from "lucide-react";
import { findUserById } from "../../data/users";
import { REVIEWS } from "../../data/reviews";
import type { Contractor } from "../../types";
import Avatar from "../../components/ui/Avatar";
import StarRating from "../../components/ui/StarRating";
import { useApp } from "../../context/AppContext";

export default function ContractorProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useApp();

  const user = findUserById(id ?? "");
  if (!user || user.role !== "contractor") {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-700 text-[13px] font-semibold" data-testid="contractor-profile-missing">
            {t("profile.notFound")}
          </p>
        </div>
      </div>
    );
  }
  const c = user as Contractor;
  const reviews = REVIEWS.filter((r) => r.toUserId === c.id);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Cover header */}
      <div
        className="relative"
        style={{ background: "linear-gradient(160deg, #0f766e, #0d9488)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-4 z-10 flex items-center gap-1 text-white/80 text-sm font-medium pressable"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center pt-10 pb-6 px-5">
          <div className="relative">
            <Avatar src={c.avatarUrl} name={c.name} size="xl" className="ring-4 ring-white/30" />
            {c.verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-300 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle size={15} className="text-teal-800" fill="#5eead4" strokeWidth={0} />
              </div>
            )}
          </div>
          <h1
            className="text-white font-extrabold text-[20px] mt-3"
            data-testid="contractor-profile-title"
          >
            {c.businessName}
          </h1>
          <p className="text-teal-100 text-sm">{c.name}</p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-amber-300" fill="#fcd34d" />
              <span className="text-white font-bold text-[15px]">{c.rating}</span>
              <span className="text-teal-200 text-xs">({c.reviewCount} {t("search.reviewsCount")})</span>
            </div>
            <div className="flex items-center gap-1 text-teal-200">
              <MapPin size={12} />
              <span className="text-xs">{c.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex">
        {[
          { label: t("profile.jobs"), value: c.completedJobs },
          { label: t("profile.response"), value: c.responseTime },
          { label: t("profile.score"), value: `${c.reliabilityScore ?? 95}%` },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span className="text-[16px] font-extrabold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/messages?contractor=${c.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-2xl text-sm pressable"
          >
            <MessageCircle size={16} />
            {t("btn.sendMessage")}
          </button>
          <button
            onClick={() => navigate(`/projects/new?contractor=${c.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl text-sm pressable"
          >
            <Shield size={16} className="text-teal-500" />
            {t("profile.hireViaEscrow")}
          </button>
        </div>

        {/* Trust badges */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t("label.badges")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {c.badges.map((b) => (
              <div
                key={b}
                className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-xl px-3 py-1.5"
              >
                <Award size={12} className="text-teal-600" />
                <span className="text-teal-700 text-[11px] font-semibold">{b}</span>
              </div>
            ))}
            {c.licenseNumber && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5">
                <CheckCircle size={12} className="text-blue-500" />
                <span className="text-blue-700 text-[11px] font-semibold">{t("profile.license")}{c.licenseNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Response time */}
        <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <Zap size={18} className="text-emerald-500" />
          <div>
            <p className="text-emerald-800 font-bold text-sm">{t("profile.typicalResponse")} {c.responseTime}</p>
            <p className="text-emerald-600 text-[11px]">
              {t("profile.respondsQuickly")}
            </p>
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t("label.about")}
          </h2>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-gray-700 text-[13px] leading-relaxed">{c.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.specialty.map((s) => (
                <span key={s} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t("label.portfolio")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {c.portfolioImages.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Portfolio ${i + 1}`}
                className="w-full h-28 object-cover rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t("label.reviews")}
          </h2>
          <div className="flex flex-col gap-3">
            {(reviews.length > 0 ? reviews : REVIEWS).map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 text-[13px]">{r.fromName}</span>
                  <StarRating value={r.rating} size="sm" />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {r.tags.map((tag) => (
                    <span key={tag} className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-[12px] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
