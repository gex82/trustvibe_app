import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "sm" | "md" | "none";
}

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

const shadows = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
};

export default function Card({
  children,
  className,
  onClick,
  padding = "md",
  shadow = "sm",
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl",
        paddings[padding],
        shadows[shadow],
        onClick && "cursor-pointer pressable",
        className
      )}
      onClick={onClick}
      style={{ boxShadow: shadow === "sm" ? "0 1px 4px rgba(0,0,0,0.08)" : shadow === "md" ? "0 4px 16px rgba(0,0,0,0.10)" : undefined }}
      {...rest}
    >
      {children}
    </div>
  );
}
