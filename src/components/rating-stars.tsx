import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  className,
  starClass = "size-4",
}: {
  rating: number;
  className?: string;
  starClass?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={cn(starClass, filled ? "fill-sun-500 text-sun-500" : "fill-line text-line")}
            strokeWidth={0}
          />
        );
      })}
    </span>
  );
}
