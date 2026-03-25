"use client";

import { motion } from "framer-motion";
import type { TaskResult } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface StarRatingProps {
  results: TaskResult[];
  totalTasks: number;
  compact?: boolean;
}

// 커스텀 별 SVG
function StarIcon({ filled, size, delay }: { filled: boolean; size: number; delay?: number }) {
  if (!filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="#E8E0F0"
          stroke="#D0C8E0"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ duration: 0.5, delay: delay ?? 0, type: "spring", stiffness: 200 }}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={COLORS.secondary}
        stroke="#E09030"
        strokeWidth="1"
      />
      {/* 반짝이 */}
      <circle cx="12" cy="10" r="1" fill="white" opacity="0.6" />
    </motion.svg>
  );
}

export default function StarRating({ results, totalTasks, compact }: StarRatingProps) {
  const starSize = compact ? 16 : 22;
  let starIndex = 0;

  return (
    <div className="flex items-center gap-0.5 flex-wrap justify-center">
      {results.map((r, i) => (
        <span key={i} className="flex gap-0.5">
          {Array.from({ length: r.stars }).map((_, s) => {
            const idx = starIndex++;
            return (
              <StarIcon key={s} filled size={starSize} delay={idx * 0.05} />
            );
          })}
        </span>
      ))}
      {/* 남은 항목 빈 별 */}
      {Array.from({ length: Math.max(0, (totalTasks - results.length) * 3) }).map((_, i) => (
        <StarIcon key={`empty-${i}`} filled={false} size={starSize} />
      )).slice(0, 6)}
    </div>
  );
}
