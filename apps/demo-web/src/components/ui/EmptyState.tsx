import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-[15px] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm pressable"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
