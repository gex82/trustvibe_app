import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  back?: boolean;
  backPath?: string;
  right?: ReactNode;
  transparent?: boolean;
  light?: boolean;
}

export default function TopBar({
  title,
  back = false,
  backPath,
  right,
  transparent = false,
  light = false,
}: TopBarProps) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useApp();

  const handleBack = () => {
    if (backPath) navigate(backPath);
    else navigate(-1);
  };

  return (
    <div
      className={`flex items-center justify-between px-4 h-11 flex-shrink-0 ${
        transparent ? "bg-transparent" : "bg-white border-b border-gray-100"
      }`}
    >
      {/* Left */}
      <div className="w-20 flex items-center">
        {back && (
          <button
            onClick={handleBack}
            className={`flex items-center gap-0.5 font-medium text-sm pressable ${
              light ? "text-white" : "text-teal-600"
            }`}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            {t("btn.back")}
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 text-center">
        {title && (
          <span
            className={`text-[15px] font-semibold truncate ${
              light ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="w-20 flex items-center justify-end gap-2">
        {right}
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className={`text-[11px] font-bold px-2 py-1 rounded-full border transition-colors pressable ${
            light
              ? "border-white/40 text-white"
              : "border-teal-200 text-teal-600 bg-teal-50"
          }`}
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>
    </div>
  );
}
