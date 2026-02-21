import type { ProjectStatus } from "../../types";
import { useApp } from "../../context/AppContext";

const statusOrder: ProjectStatus[] = [
  "draft",
  "open",
  "funded",
  "in_progress",
  "complete_requested",
  "completed",
  "disputed",
];

interface Props {
  status: ProjectStatus;
}

export default function ProgressStepper({ status }: Props) {
  const { t } = useApp();
  const steps = [
    { key: "open", label: t("step.posted") },
    { key: "funded", label: t("step.funded") },
    { key: "in_progress", label: t("step.working") },
    { key: "completed", label: t("step.done") },
  ];
  const currentIdx = statusOrder.indexOf(status);

  return (
    <div className="flex items-center px-1">
      {steps.map((step, i) => {
        const stepIdx = statusOrder.indexOf(step.key as ProjectStatus);
        const done = currentIdx > stepIdx;
        const active =
          currentIdx === stepIdx ||
          (step.key === "in_progress" && status === "complete_requested");
        const isDisputed = status === "disputed";

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-center">
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    done || active ? "bg-teal-500" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                  isDisputed && step.key === "completed"
                    ? "bg-red-100 text-red-500"
                    : done
                    ? "bg-teal-500 text-white"
                    : active
                    ? "bg-teal-600 text-white ring-4 ring-teal-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDisputed && step.key === "completed" ? "!" : done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    done ? "bg-teal-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[9px] mt-1 font-semibold ${
                active
                  ? "text-teal-600"
                  : done
                  ? "text-teal-500"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
