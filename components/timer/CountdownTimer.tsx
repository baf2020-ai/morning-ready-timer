"use client";

import { useEffect, useRef } from "react";
import { COLORS } from "@/lib/constants";
import { soundManager } from "@/lib/sounds";

interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
  enableAlerts?: boolean;
  isPaused?: boolean;  // 대기/일시정지 상태
  onTimeClick?: () => void;  // 중앙 시간 터치 콜백
}

function getTimerColor(remaining: number, total: number): string {
  const ratio = remaining / total;
  if (ratio > 0.5) return COLORS.timerGreen;
  if (ratio > 0.25) return COLORS.timerYellow;
  return COLORS.timerRed;
}

// 파이 섹터 path (12시 방향부터 시계방향)
function piePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  if (endDeg - startDeg <= 0) return "";
  if (endDeg - startDeg >= 360) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export default function CountdownTimer({ totalSeconds, remainingSeconds, size = 180, enableAlerts = true, isPaused = false, onTimeClick }: CountdownTimerProps) {
  const lastTickRef = useRef(remainingSeconds);
  const alertFiredRef = useRef(false);
  const intervalAlertedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset alert refs when task changes (totalSeconds changes)
    alertFiredRef.current = false;
    intervalAlertedRef.current = new Set();
  }, [totalSeconds]);

  useEffect(() => {
    if (remainingSeconds > 0 && remainingSeconds <= 10 && remainingSeconds !== lastTickRef.current) {
      soundManager.play("tick");
    }

    if (enableAlerts && remainingSeconds > 0 && remainingSeconds !== lastTickRef.current) {
      const elapsed = totalSeconds - remainingSeconds;
      const ratio = elapsed / totalSeconds;

      // 80% 경고: 타이머의 80% 시점에 알림
      if (ratio >= 0.8 && !alertFiredRef.current) {
        alertFiredRef.current = true;
        soundManager.play("alert");
      }

      // 10분 이상 항목: 10분 간격 알림
      if (totalSeconds >= 600) {
        const elapsedMinutes = Math.floor(elapsed / 60);
        if (elapsedMinutes > 0 && elapsedMinutes % 10 === 0 && !intervalAlertedRef.current.has(elapsedMinutes)) {
          intervalAlertedRef.current.add(elapsedMinutes);
          soundManager.play("intervalAlert");
        }
      }
    }

    lastTickRef.current = remainingSeconds;
  }, [remainingSeconds, totalSeconds, enableAlerts]);

  const isOvertime = remainingSeconds <= 0;
  const color = getTimerColor(remainingSeconds, totalSeconds);

  // 60분 다이얼 기준: 설정 시간이 차지하는 각도
  const DIAL_TOTAL = 60 * 60; // 60분 = 3600초
  // 남은 시간이 다이얼에서 차지하는 각도 (0~360)
  const remainAngle = isOvertime ? 0 : (remainingSeconds / DIAL_TOTAL) * 360;

  // 분/초 계산
  const abs = Math.abs(remainingSeconds);
  const mm = Math.floor(abs / 60).toString().padStart(2, "0");
  const ss = (abs % 60).toString().padStart(2, "0");

  const cx = 100, cy = 100, outerR = 82, innerR = 34;

  // 눈금 (60개, 5분 간격 큰 눈금)
  const ticks = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">

        {/* 외곽 케이스 */}
        <rect x="6" y="6" width="188" height="188" rx="28" ry="28" fill="white" stroke="#E8E0F0" strokeWidth="3" />

        {/* 시계판 배경 */}
        <circle cx={cx} cy={cy} r={outerR} fill="#FAFAFA" />

        {/* 남은 시간 색상 파이 - 12시부터 시계방향으로 남은 시간만큼 */}
        {remainAngle > 0 && (
          <path
            d={piePath(cx, cy, outerR - 4, 0, remainAngle)}
            fill={isPaused ? "#C8C0D8" : color}
            opacity={isPaused ? 0.25 : 0.4}
          />
        )}

        {/* 오버타임: 깜빡임 */}
        {isOvertime && (
          <circle cx={cx} cy={cy} r={outerR - 4} fill={COLORS.timerRed} opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.3;0.15" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* 눈금 */}
        {ticks.map((i) => {
          const angle = ((i * 6 - 90) * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const r1 = outerR - (isMajor ? 12 : 6);
          const r2 = outerR - 2;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(angle)}
              y1={cy + r1 * Math.sin(angle)}
              x2={cx + r2 * Math.cos(angle)}
              y2={cy + r2 * Math.sin(angle)}
              stroke={isMajor ? COLORS.textDark : "#D0C8E0"}
              strokeWidth={isMajor ? 2 : 1}
              strokeLinecap="round"
              opacity={isPaused ? 0.4 : 1}
            />
          );
        })}

        {/* 분 숫자 라벨 (5분 단위) */}
        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
          const angle = ((m / 60) * 360 - 90) * Math.PI / 180;
          const labelR = outerR - 20;
          return (
            <text
              key={m}
              x={cx + labelR * Math.cos(angle)}
              y={cy + labelR * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontFamily="Fredoka, sans-serif"
              fontWeight={m === 0 ? "bold" : "normal"}
              fill={m === 0 ? COLORS.textDark : COLORS.textSub}
              opacity={isPaused ? 0.4 : 1}
            >
              {m}
            </text>
          );
        })}

        {/* 남은 시간 경계선 (파이 끝 위치) */}
        {!isOvertime && remainAngle > 0 && (() => {
          const edgeAngle = ((remainAngle - 90) * Math.PI) / 180;
          const x1 = cx + (innerR + 2) * Math.cos(edgeAngle);
          const y1 = cy + (innerR + 2) * Math.sin(edgeAngle);
          const x2 = cx + (outerR - 3) * Math.cos(edgeAngle);
          const y2 = cy + (outerR - 3) * Math.sin(edgeAngle);
          return (
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          );
        })()}

        {/* 중앙 원 (노브) - 클릭 가능 */}
        <g
          onClick={onTimeClick}
          style={{ cursor: onTimeClick ? "pointer" : "default" }}
        >
          <circle cx={cx} cy={cy} r={innerR} fill="white" stroke="#E8E0F0" strokeWidth="2" />

          {/* 중앙 시간 표시 - 크게 */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={isOvertime ? "22" : "26"}
            fontWeight="bold"
            fontFamily="Fredoka, sans-serif"
            fill={isOvertime ? COLORS.timerRed : COLORS.textDark}
          >
            {isOvertime ? `+${mm}:${ss}` : `${mm}:${ss}`}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="Jua, sans-serif"
            fill={isOvertime ? COLORS.timerRed : COLORS.textSub}
          >
            {isOvertime ? "시간 초과!" : `${Number(mm)}분 ${Number(ss)}초`}
          </text>

          {/* 대기 상태: 탭하여 시작 안내 */}
          {isPaused && !isOvertime && (
            <text
              x={cx}
              y={cy + 26}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fontFamily="Jua, sans-serif"
              fill={COLORS.primary}
              opacity={0.7}
            >
              ▶ 탭하여 시작
            </text>
          )}
        </g>

      </svg>
    </div>
  );
}
