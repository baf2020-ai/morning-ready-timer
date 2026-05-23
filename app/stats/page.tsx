"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStatsStore } from "@/stores/useStatsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Character from "@/components/svg/characters/Character";
import { COLORS } from "@/lib/constants";
import { SunIcon, MoonIcon } from "@/components/svg/icons/RoutineIcons";
import type { RoutineType, CharacterType, DailyRecord } from "@/lib/types";

const WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE_APPLES = 8;
const APPLE_POSITIONS = [
  { x: 74, y: 38 },
  { x: 104, y: 48 },
  { x: 48, y: 58 },
  { x: 88, y: 70 },
  { x: 122, y: 78 },
  { x: 62, y: 92 },
  { x: 108, y: 103 },
  { x: 82, y: 118 },
];

/** 월간 캘린더 날짜 배열 생성 (앞뒤 빈칸 포함) */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=일
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const cells: ({ dateStr: string; day: number; isToday: boolean } | null)[] = [];

  // 앞쪽 빈칸
  for (let i = 0; i < startWeekday; i++) cells.push(null);

  // 날짜 채우기
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split("T")[0];
    cells.push({ dateStr, day: d, isToday: dateStr === todayStr });
  }

  return cells;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

function getRecordAppleCount(record: DailyRecord): number {
  return record.sessions.filter((session) => session.isAllClear).length;
}

function getPlayerAppleCount(record: DailyRecord, profileId: string): number {
  return record.sessions.filter((session) => session.profileId === profileId && session.isAllClear).length;
}

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function MiniAppleTree({ appleCount }: { appleCount: number }) {
  const visibleApples = Math.min(appleCount, MAX_VISIBLE_APPLES);
  const extraApples = Math.max(appleCount - MAX_VISIBLE_APPLES, 0);

  return (
    <div
      className="relative flex h-28 w-32 flex-shrink-0 items-center justify-center"
      aria-label={`열린 사과 ${appleCount}개`}
    >
      <svg viewBox="0 0 160 150" className="h-full w-full" role="img" aria-hidden="true">
        <ellipse cx="82" cy="132" rx="52" ry="9" fill="#DDECC2" opacity="0.9" />
        <path
          d="M74 70 C70 92 66 111 57 132 L104 132 C94 110 90 90 86 70 Z"
          fill="#B46D3D"
        />
        <path
          d="M79 78 C61 83 45 88 34 99"
          fill="none"
          stroke="#8C542F"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M83 76 C101 79 117 85 129 97"
          fill="none"
          stroke="#8C542F"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="52" cy="61" r="34" fill="#8ECF74" />
        <circle cx="85" cy="43" r="40" fill="#A8DC70" />
        <circle cx="115" cy="65" r="34" fill="#7DBD63" />
        <circle cx="77" cy="78" r="42" fill="#79C85F" />
        <circle cx="106" cy="92" r="36" fill="#6FB653" />
        {APPLE_POSITIONS.slice(0, visibleApples).map((pos, index) => (
          <g key={`${pos.x}-${pos.y}`}>
            <circle cx={pos.x} cy={pos.y} r="7" fill="#F45D4F" />
            <circle cx={pos.x - 2} cy={pos.y - 2} r="2" fill="#FFD2C6" opacity="0.8" />
            <path
              d={`M${pos.x + 1} ${pos.y - 8} C${pos.x + 5} ${pos.y - 13} ${pos.x + 11} ${pos.y - 12} ${pos.x + 13} ${pos.y - 8}`}
              fill="none"
              stroke={index % 2 === 0 ? "#3E8E48" : "#5AA35C"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ))}
        {extraApples > 0 && (
          <g>
            <circle cx="127" cy="112" r="17" fill="#FFF7DF" stroke="#FDCB6E" strokeWidth="3" />
            <text x="127" y="117" textAnchor="middle" fontSize="14" fontWeight="700" fill="#E85D4F">
              +{extraApples}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function AppleTreeSummaryCard({
  title,
  subtitle,
  appleCount,
}: {
  title: string;
  subtitle: string;
  appleCount: number;
}) {
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="flex items-center gap-3 rounded-3xl p-4"
      style={{
        backgroundColor: "#FFFDF5",
        border: "3px solid #FDCB6E",
        boxShadow: "0 4px 0 #E5B85C",
      }}
    >
      <MiniAppleTree appleCount={appleCount} />
      <div className="min-w-0 flex-1">
        <p className="text-base" style={{ color: COLORS.textDark }}>
          {title}
        </p>
        <p className="text-xs mt-1" style={{ color: COLORS.textSub }}>
          {subtitle}
        </p>
        <div
          className="mt-3 inline-flex items-baseline gap-1 rounded-full px-4 py-2"
          style={{ backgroundColor: "#FFEDE8", color: "#E85D4F" }}
        >
          <span className="text-xs">열린 사과</span>
          <span className="text-2xl font-bold" style={{ fontFamily: "Fredoka" }}>
            {appleCount}
          </span>
          <span className="text-sm">개</span>
        </div>
      </div>
    </motion.div>
  );
}

/** 월 네비게이션 헤더 */
function MonthNav({ year, month, onChange }: { year: number; month: number; onChange: (y: number, m: number) => void }) {
  const goPrev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };
  const goNext = () => {
    const now = new Date();
    const nextDate = month === 11 ? new Date(year + 1, 0, 1) : new Date(year, month + 1, 1);
    if (nextDate > new Date(now.getFullYear(), now.getMonth() + 1, 0)) return; // 미래 제한
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex items-center justify-between px-2 mb-3">
      <button
        onClick={goPrev}
        className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
        style={{ backgroundColor: "#F0EBFF", color: COLORS.primary }}
      >
        ◀
      </button>
      <span className="text-base font-bold" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
        {year}년 {MONTH_NAMES[month]}
      </span>
      <button
        onClick={goNext}
        className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
        style={{
          backgroundColor: isCurrentMonth ? "#F5F0FF" : "#F0EBFF",
          color: isCurrentMonth ? "#D0C8E0" : COLORS.primary,
        }}
        disabled={isCurrentMonth}
      >
        ▶
      </button>
    </div>
  );
}

/** 사과나무 통계 - 전체 */
function AppleBoardOverview({ routineFilter }: { routineFilter: RoutineType }) {
  const allRecords = useStatsStore((s) => s.records);
  const streak = useStatsStore((s) => s.getStreak());

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const records = allRecords.filter((r) => (r.routineType ?? "morning") === routineFilter);
  const calendarDays = getCalendarDays(year, month);

  // 이번 달 통계
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));
  const monthCompleted = monthRecords.filter((r) => r.isAllClear).length;
  const monthApples = monthRecords.reduce((sum, r) => sum + getRecordAppleCount(r), 0);
  const appleRecords = monthRecords.filter((record) => getRecordAppleCount(record) > 0);

  return (
    <div className="space-y-4">

      {/* 연속 기록 배지 */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex items-center justify-center gap-2 py-2"
        >
          <div
            className="flex items-center gap-2 px-5 py-2 rounded-full"
            style={{ backgroundColor: COLORS.accent, boxShadow: `0 3px 0 #C0356B` }}
          >
            <span className="text-white text-lg" style={{ fontFamily: "Fredoka" }}>
              {streak}일 연속!
            </span>
          </div>
        </motion.div>
      )}

      <AppleTreeSummaryCard
        title="우리 집 사과나무"
        subtitle="우리 집 사과나무가 자라고 있어요"
        appleCount={monthApples}
      />

      {/* 캘린더 */}
      <div
        className="rounded-3xl p-4"
        style={{
          backgroundColor: "#FFFDF5",
          border: "3px solid #FDCB6E",
          boxShadow: "0 4px 0 #E5B85C",
        }}
      >
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {/* 요일 헤더 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {WEEKDAY_SHORT.map((wd) => (
            <div key={wd} className="text-center py-1">
              <span className="text-[10px] font-bold" style={{ color: COLORS.textSub }}>{wd}</span>
            </div>
          ))}

          {/* 날짜 셀 */}
          {calendarDays.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;

            const record = records.find((r) => r.date === cell.dateStr);
            const appleCount = record ? getRecordAppleCount(record) : 0;
            const hasApple = appleCount > 0;

            return (
              <motion.div
                key={cell.dateStr}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.3), type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center py-0.5"
              >
                <div
                  className="relative flex items-center justify-center rounded-xl"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: hasApple ? "#FFEDE8" : cell.isToday ? "#F0EBFF" : "transparent",
                    border: hasApple ? "2px solid #F4A79B" : cell.isToday ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasApple ? "0 2px 0 rgba(232,93,79,0.18)" : "none",
                  }}
                >
                  {hasApple ? (
                    <span className="flex items-center gap-0.5 leading-none" style={{ color: "#E85D4F" }}>
                      <span className="text-[15px]">🍎</span>
                      <span className="text-[10px] font-bold" style={{ fontFamily: "Fredoka" }}>{appleCount}</span>
                    </span>
                  ) : (
                    <span className="text-[11px]" style={{ color: cell.isToday ? COLORS.primary : "#C0B8D0" }}>
                      {cell.day}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 월간 요약 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: "#E85D4F", fontFamily: "Fredoka" }}>{monthApples}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>열린 사과</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.mint, fontFamily: "Fredoka" }}>{monthCompleted}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>완료 일수</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.accent, fontFamily: "Fredoka" }}>{streak}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>연속 기록</span>
        </div>
      </div>

      {/* 이번 달 기록 상세 */}
      <div className="space-y-2">
        {appleRecords.slice().reverse().map((record) => {
          const appleCount = getRecordAppleCount(record);
          const d = new Date(record.date + "T00:00:00");
          return (
            <motion.div
              key={record.date}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ backgroundColor: "white", border: "2px solid #F0EBFF" }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 44, height: 44,
                  backgroundColor: "#FFEDE8",
                  boxShadow: "0 2px 0 rgba(232,93,79,0.15)",
                  transform: "rotate(-3deg)",
                }}
              >
                <span className="text-2xl">🍎</span>
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: COLORS.textDark }}>
                  {d.getDate()}일 ({WEEKDAY_SHORT[d.getDay()]})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(record.totalSeconds)} · 열린 사과 {appleCount}개
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: "#E85D4F" }}
              >
                🍎 {appleCount}
              </span>
            </motion.div>
          );
        })}
      </div>

      {monthApples === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🍎</p>
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            이번 달 열린 사과가 없어요!<br />{routineFilter === "morning" ? "등원" : "잠자리"} 준비를 시간 안에 완료하면 사과를 받을 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}

/** 사과나무 통계 - 개인별 */
function PlayerAppleBoard({ profile, routineFilter }: { profile: { id: string; name: string; characterType: CharacterType }; routineFilter: RoutineType }) {
  const allRecords = useStatsStore((s) => s.records);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const records = allRecords.filter((r) => (r.routineType ?? "morning") === routineFilter);
  const calendarDays = getCalendarDays(year, month);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

  // 개인 월간 통계
  const monthSessions = monthRecords.flatMap((r) =>
    r.sessions.filter((s) => s.profileId === profile.id)
  );
  const monthCompleted = monthSessions.filter((s) => s.isAllClear).length;
  const monthApples = monthSessions.filter((s) => s.isAllClear).length;
  const appleSessionRecords = monthRecords.filter((record) =>
    record.sessions.some((session) => session.profileId === profile.id && session.isAllClear)
  );

  return (
    <div className="space-y-4">
      {/* 캐릭터 프로필 */}
      <div className="flex flex-col items-center gap-1">
        <div className="char-idle">
          <Character type={profile.characterType} expression="happy" size={70} variant="cutout" />
        </div>
        <p className="text-lg" style={{ color: COLORS.primary }}>{profile.name}</p>
      </div>

      <AppleTreeSummaryCard
        title={`${profile.name}의 사과나무`}
        subtitle={`${profile.name}의 사과나무가 자라고 있어요`}
        appleCount={monthApples}
      />

      {/* 캘린더 */}
      <div
        className="rounded-3xl p-4"
        style={{
          backgroundColor: "#FFFDF5",
          border: "3px solid #FDCB6E",
          boxShadow: "0 4px 0 #E5B85C",
        }}
      >
        <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {WEEKDAY_SHORT.map((wd) => (
            <div key={wd} className="text-center py-1">
              <span className="text-[10px] font-bold" style={{ color: COLORS.textSub }}>{wd}</span>
            </div>
          ))}

          {calendarDays.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;

            const record = records.find((r) => r.date === cell.dateStr);
            const appleCount = record ? getPlayerAppleCount(record, profile.id) : 0;
            const hasApple = appleCount > 0;

            return (
              <motion.div
                key={cell.dateStr}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.3), type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center py-0.5"
              >
                <div
                  className="relative flex items-center justify-center rounded-xl"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: hasApple ? "#FFEDE8" : cell.isToday ? "#F0EBFF" : "transparent",
                    border: hasApple ? "2px solid #F4A79B" : cell.isToday ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasApple ? "0 2px 0 rgba(232,93,79,0.18)" : "none",
                  }}
                >
                  {hasApple ? (
                    <span className="flex items-center gap-0.5 leading-none" style={{ color: "#E85D4F" }}>
                      <span className="text-[15px]">🍎</span>
                      {appleCount > 1 && (
                        <span className="text-[10px] font-bold" style={{ fontFamily: "Fredoka" }}>{appleCount}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px]" style={{ color: cell.isToday ? COLORS.primary : "#C0B8D0" }}>
                      {cell.day}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 월간 요약 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: "#E85D4F", fontFamily: "Fredoka" }}>{monthApples}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>열린 사과</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.mint, fontFamily: "Fredoka" }}>{monthCompleted}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>완료 일수</span>
        </div>
      </div>

      {/* 일별 상세 */}
      <div className="space-y-2">
        {appleSessionRecords.slice().reverse().map((record) => {
          const session = record.sessions.find((s) => s.profileId === profile.id && s.isAllClear)!;
          const appleCount = getPlayerAppleCount(record, profile.id);
          const d = new Date(record.date + "T00:00:00");
          return (
            <motion.div
              key={record.date}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ backgroundColor: "white", border: "2px solid #F0EBFF" }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 44, height: 44,
                  backgroundColor: "#FFEDE8",
                  boxShadow: "0 2px 0 rgba(232,93,79,0.15)",
                  transform: "rotate(-3deg)",
                }}
              >
                <span className="text-2xl">🍎</span>
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: COLORS.textDark }}>
                  {d.getDate()}일 ({WEEKDAY_SHORT[d.getDay()]})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(session.seconds)} · 열린 사과 {appleCount}개
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: "#E85D4F" }}
              >
                🍎 {appleCount}
              </span>
            </motion.div>
          );
        })}
      </div>

      {monthApples === 0 && (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            {profile.name}의 이번 달 열린 사과가 없어요!
          </p>
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const profiles = useSettingsStore((s) => s.settings.profiles);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [routineFilter, setRoutineFilter] = useState<RoutineType>("morning");

  const tabs = [
    { id: "overview", label: "전체" },
    ...profiles.map((p) => ({ id: p.id, label: p.name })),
  ];

  return (
    <div className="flex flex-col h-full paper-bg" style={{ backgroundColor: COLORS.bgPurple }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#FFFFFF", borderBottom: `2px solid #F0EBFF` }}
      >
        <button
          onClick={() => router.back()}
          className="text-sm px-3 py-1 rounded-full"
          style={{ color: COLORS.textSub, backgroundColor: "rgba(108,92,231,0.06)" }}
        >
          ← 뒤로
        </button>
        <h1 className="text-lg" style={{ color: COLORS.primary }}>사과나무 통계</h1>
        <div className="w-10" />
      </div>

      {/* 루틴 선택 */}
      <div className="flex items-center justify-center py-2 gap-1" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex rounded-full p-0.5" style={{ backgroundColor: "#F0EBFF" }}>
          {(["morning", "bedtime"] as RoutineType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoutineFilter(r)}
              className="px-4 py-1.5 rounded-full text-xs transition-all"
              style={{
                backgroundColor: routineFilter === r ? COLORS.primary : "transparent",
                color: routineFilter === r ? "white" : COLORS.textSub,
              }}
            >
              <span className="flex items-center gap-1">{r === "morning" ? <><SunIcon size={12} /> 등원</> : <><MoonIcon size={12} /> 잠자리</>}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 바 */}
      <div className="flex" style={{ backgroundColor: "#FFFFFF", borderBottom: `2px solid #F0EBFF` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-sm text-center transition-colors relative"
            style={{
              color: activeTab === tab.id ? COLORS.primary : COLORS.textSub,
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full"
                style={{ backgroundColor: COLORS.primary }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "overview" ? (
          <AppleBoardOverview routineFilter={routineFilter} />
        ) : (
          <PlayerAppleBoard
            profile={profiles.find((p) => p.id === activeTab) ?? profiles[0]}
            routineFilter={routineFilter}
          />
        )}
      </div>
    </div>
  );
}
