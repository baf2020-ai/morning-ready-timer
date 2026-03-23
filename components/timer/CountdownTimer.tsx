"use client";

import { useEffect, useRef } from "react";
import { COLORS } from "@/lib/constants";
import { soundManager } from "@/lib/sounds";

interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
}

function getTimerColor(remaining: number, total: number): string {
  const ratio = remaining / total;
  if (ratio > 0.5) return COLORS.timerGreen;
  if (ratio > 0.25) return COLORS.timerYellow;
  return COLORS.timerRed;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CountdownTimer({ totalSeconds, remainingSeconds, size = 180 }: CountdownTimerProps) {
  const lastTickRef = useRef(remainingSeconds);

  // Play tick sound in last 10 seconds
  useEffect(() => {
    if (remainingSeconds > 0 && remainingSeconds <= 10 && remainingSeconds !== lastTickRef.current) {
      soundManager.play("tick");
    }
    lastTickRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, remainingSeconds / totalSeconds);
  const dashOffset = circumference * (1 - progress);
  const color = getTimerColor(remainingSeconds, totalSeconds);
  const isOvertime = remainingSeconds <= 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {/* 배경 원 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#F0F0F0"
          strokeWidth="12"
        />
        {/* 프로그레스 원 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
        />
        {/* 시간 텍스트 */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isOvertime ? "32" : "40"}
          fontWeight="bold"
          fill={isOvertime ? COLORS.timerRed : COLORS.textDark}
        >
          {isOvertime ? "+" + formatTime(-remainingSeconds) : formatTime(remainingSeconds)}
        </text>
        {isOvertime && (
          <text
            x="100"
            y="125"
            textAnchor="middle"
            fontSize="14"
            fill={COLORS.timerRed}
          >
            시간 초과!
          </text>
        )}
      </svg>
    </div>
  );
}
