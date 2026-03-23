"use client";

import type { TaskResult } from "@/lib/types";

interface StarRatingProps {
  results: TaskResult[];
  totalTasks: number;
  compact?: boolean;
}

export default function StarRating({ results, totalTasks, compact }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap justify-center">
      {results.map((r, i) => (
        <span key={i} className="flex">
          {Array.from({ length: r.stars }).map((_, s) => (
            <span key={s} className={compact ? "text-sm" : "text-lg"}>⭐</span>
          ))}
          {!compact && i < results.length - 1 && <span className="mx-0.5" />}
        </span>
      ))}
      {/* 남은 항목 빈 별 */}
      {Array.from({ length: totalTasks - results.length }).map((_, i) => (
        <span key={`empty-${i}`} className={compact ? "text-sm opacity-30" : "text-lg opacity-30"}>
          ○
        </span>
      ))}
    </div>
  );
}
