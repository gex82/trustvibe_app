import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm",
  secondary:
    "bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700",
  ghost: "text-teal-600 hover:bg-teal-50 active:bg-teal-100",
  danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm",
  success:
    "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm",
};

const sizes = {
  sm: "px-3 py-2 text-sm rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3.5 text-base rounded-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  full,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "font-semibold transition-all duration-150 pressable",
        variants[variant],
        sizes[size],
        full && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
