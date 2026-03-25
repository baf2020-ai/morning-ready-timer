"use client";

import { motion } from "framer-motion";
import type { CharacterType } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import Character from "@/components/svg/characters/Character";

interface ProgressRoadProps {
  totalSteps: number;
  currentStep: number;
  characterType: CharacterType;
  compact?: boolean;
}

// S자 곡선 경로 생성
function generateSCurve(totalSteps: number, width: number, height: number, padding: number) {
  const points: { x: number; y: number }[] = [];
  const totalNodes = totalSteps + 2; // 집 + 태스크들 + 학교
  const stepX = (width - padding * 2) / (totalNodes - 1);
  const amplitude = height * 0.15;

  for (let i = 0; i < totalNodes; i++) {
    const x = padding + stepX * i;
    const y = height / 2 + Math.sin((i / (totalNodes - 1)) * Math.PI * 2) * amplitude;
    points.push({ x, y });
  }
  return points;
}

function generatePath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx} ${prev.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function ProgressRoad({ totalSteps, currentStep, characterType, compact }: ProgressRoadProps) {
  const width = compact ? 280 : 360;
  const height = compact ? 55 : 70;
  const padding = 28;

  const points = generateSCurve(totalSteps, width, height, padding);
  const pathD = generatePath(points);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* 점선 길 (미완료) */}
      <path
        d={pathD}
        fill="none"
        stroke="#E8E0F0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="8 6"
      />

      {/* 완료된 길 (실선) */}
      {currentStep > 0 && (
        <path
          d={generatePath(points.slice(0, currentStep + 1))}
          fill="none"
          stroke={COLORS.secondary}
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}

      {/* 집 아이콘 (커스텀 SVG) */}
      <g transform={`translate(${points[0].x - 10}, ${points[0].y - 14})`}>
        <path d="M10 8 L2 14 L2 22 L18 22 L18 14 Z" fill={COLORS.secondary} stroke={COLORS.textDark} strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="8" y="16" width="4" height="6" rx="1" fill={COLORS.bgLight} />
      </g>

      {/* 노드들 */}
      {points.slice(1, -1).map((p, i) => {
        const done = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <g key={i}>
            {/* 펄스 링 (현재 노드) */}
            {isCurrent && (
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="2"
                opacity="0.4"
              >
                <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* 노드 */}
            <circle
              cx={p.x}
              cy={p.y}
              r={done ? 7 : isCurrent ? 8 : 5}
              fill={done ? COLORS.secondary : isCurrent ? COLORS.primary : "#E8E0F0"}
              stroke={done ? "#E09030" : isCurrent ? "#5041C0" : "#D0C8E0"}
              strokeWidth="2.5"
            />
            {/* 완료 체크 (SVG) */}
            {done && (
              <g transform={`translate(${p.x - 4}, ${p.y - 4})`}>
                <polyline points="2,4 4,7 7,2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}

      {/* 학교 아이콘 (커스텀 SVG) */}
      <g transform={`translate(${points[points.length - 1].x - 10}, ${points[points.length - 1].y - 16})`}>
        <rect x="2" y="10" width="16" height="12" rx="2" fill={COLORS.primary} stroke={COLORS.textDark} strokeWidth="1.5" />
        <polygon points="10,4 1,10 19,10" fill={COLORS.accent} stroke={COLORS.textDark} strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="8" y="14" width="4" height="8" rx="1" fill={COLORS.bgLight} />
        <circle cx="10" cy="7" r="1.5" fill={COLORS.secondary} />
      </g>

      {/* 캐릭터 (현재 위치) */}
      <motion.g
        animate={{
          x: points[Math.min(currentStep, points.length - 1)].x - (compact ? 14 : 18),
          y: points[Math.min(currentStep, points.length - 1)].y - (compact ? 34 : 42),
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <g className="char-idle">
          <Character type={characterType} expression="happy" size={compact ? 28 : 36} />
        </g>
      </motion.g>

      {/* 장식: 작은 별 (SVG) */}
      {points.slice(1, -1).filter((_, i) => i % 2 === 0 && i < currentStep).map((p, i) => (
        <circle key={`deco-${i}`} cx={p.x + 12} cy={p.y - 10} r="2" fill={COLORS.secondary} opacity="0.4" />
      ))}
    </svg>
  );
}
