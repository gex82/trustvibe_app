import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function RoleSelectScreen() {
  const navigate = useNavigate();
  const { t } = useApp();

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #0f766e 0%, #0d9488 45%, #134e4a 100%)" }}
    >
      <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4">
        <ShieldCheck className="text-white" size={42} />
      </div>
      <h1 className="text-white text-3xl font-extrabold tracking-tight mb-2">
        TrustVibe
      </h1>
      <p className="text-teal-100 text-center text-sm max-w-[260px] mb-6">
        {t("trust.subtitle")}
      </p>

      <div className="w-full max-w-[280px] flex flex-col gap-3">
        <button
          data-testid="role-select-customer"
          className="w-full rounded-2xl bg-white text-teal-700 font-bold py-3.5 pressable"
          onClick={() => navigate("/login?role=customer")}
        >
          Continue as Customer
        </button>
        <button
          data-testid="role-select-contractor"
          className="w-full rounded-2xl bg-white/15 text-white border border-white/35 font-bold py-3.5 pressable"
          onClick={() => navigate("/login?role=contractor")}
        >
          Continue as Contractor
        </button>
        <button
          data-testid="role-select-admin"
          className="w-full rounded-2xl bg-white/10 text-white border border-white/25 font-semibold py-3 pressable"
          onClick={() => navigate("/login?role=admin")}
        >
          Continue as Admin
        </button>
      </div>
    </div>
  );
}
