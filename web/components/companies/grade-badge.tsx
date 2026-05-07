import { cn } from "@/lib/utils";
import { gradeGradientClass } from "@/lib/score";
import type { Grade } from "@/lib/types";

interface Props {
  grade: Grade | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "size-6 text-xs",
  md: "size-9 text-base",
  lg: "size-14 text-2xl",
  xl: "size-24 text-5xl",
};

export function GradeBadge({ grade, size = "md", className }: Props) {
  if (!grade) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold",
          SIZES[size],
          className,
        )}
      >
        —
      </div>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white shadow-lg",
        gradeGradientClass(grade),
        SIZES[size],
        className,
      )}
    >
      {grade}
    </div>
  );
}
