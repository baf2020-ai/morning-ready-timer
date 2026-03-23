"use client";

import { motion } from "framer-motion";
import type { CharacterType } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface ProgressRoadProps {
  totalSteps: number;
  currentStep: number;
  characterType: CharacterType;
  compact?: boolean;
}

const CHAR_EMOJI: Record<CharacterType, string> = {
  bunny: "🐰",
  bear: "🐻",
  cat: "🐱",
  penguin: "🐧",
};

export default function ProgressRoad({ totalSteps, currentStep, characterType, compact }: ProgressRoadProps) {
  const width = compact ? 280 : 360;
  const padding = 30;
  const usable = width - padding * 2;
  const stepWidth = usable / (totalSteps + 1);

  return (
    <svg width={width} height={compact ? 50 : 60} viewBox={`0 0 ${width} ${compact ? 50 : 60}`}>
      {/* 길 */}
      <line
        x1={padding}
        y1={30}
        x2={width - padding}
        y2={30}
        stroke="#E0E0E0"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 집 */}
      <text x={padding - 5} y={35} fontSize="20">🏠</text>

      {/* 노드들 */}
      {Array.from({ length: totalSteps }).map((_, i) => {
        const x = padding + stepWidth * (i + 1);
        const done = i < currentStep;
        return (
          <circle
            key={i}
            cx={x}
            cy={30}
            r={6}
            fill={done ? COLORS.accent : "#E0E0E0"}
            stroke={done ? "#FFB300" : "#CCC"}
            strokeWidth="2"
          />
        );
      })}

      {/* 학교 */}
      <text x={width - padding - 5} y={35} fontSize="20">🏫</text>

      {/* 캐릭터 */}
      <motion.text
        x={padding + stepWidth * currentStep}
        y={18}
        fontSize="22"
        textAnchor="middle"
        animate={{ x: padding + stepWidth * currentStep }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {CHAR_EMOJI[characterType]}
      </motion.text>
    </svg>
  );
}
