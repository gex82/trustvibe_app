import { Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface Props {
  compact?: boolean;
}

export default function TrustBadge({ compact = false }: Props) {
  const { t } = useApp();

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full">
        <Shield size={12} fill="#14b8a6" strokeWidth={0} className="text-teal-500" />
        {t("escrow.protected")}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 text-white"
      style={{
        background: "linear-gradient(135deg, #0f766e, #0d9488, #14b8a6)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Shield size={22} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <div>
          <p className="font-bold text-[15px]">{t("escrow.protected")}</p>
          <p className="text-teal-100 text-[12px] mt-0.5 leading-relaxed">
            {t("escrow.protected.sub")}
          </p>
        </div>
      </div>
    </div>
  );
}
