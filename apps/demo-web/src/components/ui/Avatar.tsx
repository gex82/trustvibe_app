import { cn } from "../../utils/cn";

interface Props {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getBgColor(name: string): string {
  const colors = [
    "bg-teal-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx] ?? "bg-teal-500";
}

export default function Avatar({ src, name, size = "md", className }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover flex-shrink-0", sizes[size], className)}
        onError={(e) => {
          // Fallback to initials on error
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        getBgColor(name),
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
