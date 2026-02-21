import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  testIdPrefix?: string;
}

const sizes = {
  sm: 14,
  md: 18,
  lg: 28,
};

export default function StarRating({
  value,
  onChange,
  size = "md",
  className,
  testIdPrefix = "review-star",
}: Props) {
  const px = sizes[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          data-testid={`${testIdPrefix}-${star}`}
          className={cn(
            "transition-transform",
            onChange ? "pressable cursor-pointer" : "cursor-default"
          )}
        >
          <Star
            size={px}
            className={star <= value ? "text-amber-400" : "text-gray-200"}
            fill={star <= value ? "#fbbf24" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
