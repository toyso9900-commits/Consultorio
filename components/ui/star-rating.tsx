"use client";

import { Star } from "lucide-react";

export interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, reviewCount, size = "md" }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const starClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex"
        aria-label={`${clamped.toFixed(1)} out of 5 stars`}
        role="img"
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, clamped - index)) * 100;

          return (
            <div key={index} className={`relative ${starClass}`}>
              <Star className={`${starClass} text-muted-foreground`} />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
                aria-hidden="true"
              >
                <Star className={`${starClass} fill-yellow-400 text-yellow-400`} />
              </div>
            </div>
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
