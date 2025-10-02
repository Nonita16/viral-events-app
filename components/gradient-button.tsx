import Link from "next/link";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function GradientButton({
  href,
  onClick,
  children,
  className,
  type = "button",
  disabled = false,
}: GradientButtonProps) {
  const baseClasses =
    "inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cn(baseClasses, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, className)}
    >
      {children}
    </button>
  );
}
