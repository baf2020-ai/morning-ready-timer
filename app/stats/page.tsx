"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStatsStore } from "@/stores/useStatsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Character from "@/components/svg/characters/Character";
import { COLORS } from "@/lib/constants";
import { SunIcon, MoonIcon } from "@/components/svg/icons/RoutineIcons";
import type { RoutineType } from "@/lib/types";

// 칭찬 스티커 종류 (별 개수별)
const STICKER_BY_STARS: Record<number, { emoji: string; color: string; label: string }> = {
  0: { emoji: "", color: "#E8E0F0", label: "" },
  1: { emoji: "👍", color: "#FDCB6E", label: "잘했어" },
  2: { emoji: "🌟", color: "#FFAD42", label: "멋져" },
  3: { emoji: "🏆", color: "#E84393", label: "최고" },
};

function getSticker(stars: number) {
  if (stars >= 15) return STICKER_BY_STARS[3];
  if (stars >= 10) return STICKER_BY_STARS[2];
  if (stars > 0) return STICKER_BY_STARS[1];
  return STICKER_BY_STARS[0];
}

const WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

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

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

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

/** 칭찬 스티커판 - 전체 (캘린더) */
function StickerBoardOverview({ routineFilter }: { routineFilter: RoutineType }) {
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
  const monthStars = monthRecords.reduce((sum, r) => sum + r.totalStars, 0);
  const monthCompleted = monthRecords.filter((r) => r.isAllClear).length;

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
            const sticker = getSticker(record?.totalStars ?? 0);
            const hasRecord = !!record;

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
                    backgroundColor: hasRecord ? sticker.color : cell.isToday ? "#F0EBFF" : "transparent",
                    border: cell.isToday ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasRecord ? `0 2px 0 rgba(0,0,0,0.1)` : "none",
                  }}
                >
                  {hasRecord ? (
                    <span className="text-lg">{sticker.emoji}</span>
                  ) : (
                    <span className="text-[11px]" style={{ color: cell.isToday ? COLORS.primary : "#C0B8D0" }}>
                      {cell.day}
                    </span>
                  )}
                </div>
                {hasRecord && (
                  <span className="text-[8px]" style={{ color: COLORS.textSub, fontFamily: "Fredoka" }}>
                    ★{record!.totalStars}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 월간 요약 */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.primary, fontFamily: "Fredoka" }}>{monthStars}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>별 모음</span>
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

      {/* 스티커 범례 */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((level) => {
          const s = STICKER_BY_STARS[level];
          return (
            <div key={level} className="flex items-center gap-1">
              <span className="text-sm">{s.emoji}</span>
              <span className="text-[10px]" style={{ color: COLORS.textSub }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* 이번 달 기록 상세 */}
      <div className="space-y-2">
        {monthRecords.slice().reverse().map((record) => {
          const sticker = getSticker(record.totalStars);
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
                  backgroundColor: sticker.color,
                  boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
                  transform: "rotate(-3deg)",
                }}
              >
                <span className="text-2xl">{sticker.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: COLORS.textDark }}>
                  {d.getDate()}일 ({WEEKDAY_SHORT[d.getDay()]})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(record.totalSeconds)} · {sticker.label}
                </p>
              </div>
              {record.isAllClear && (
                <span
                  className="text-[10px] px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: COLORS.mint }}
                >
                  완료
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {monthRecords.length === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            이번 달 스티커가 없어요!<br />{routineFilter === "morning" ? "등원" : "잠자리"} 준비를 완료하면 스티커를 받을 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}

/** 칭찬 스티커판 - 개인별 (캘린더) */
function PlayerStickerBoard({ profile, routineFilter }: { profile: { id: string; name: string; characterType: "bunny" | "bear" | "cat" | "penguin" }; routineFilter: RoutineType }) {
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
  const monthStars = monthSessions.reduce((sum, s) => sum + s.stars, 0);
  const monthCompleted = monthSessions.filter((s) => s.isAllClear).length;

  return (
    <div className="space-y-4">
      {/* 캐릭터 프로필 */}
      <div className="flex flex-col items-center gap-1">
        <div className="char-idle">
          <Character type={profile.characterType} expression="happy" size={70} />
        </div>
        <p className="text-lg" style={{ color: COLORS.primary }}>{profile.name}</p>
      </div>

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
            const session = record?.sessions.find((s) => s.profileId === profile.id);
            const sticker = getSticker(session?.stars ?? 0);
            const hasSession = !!session;

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
                    backgroundColor: hasSession ? sticker.color : cell.isToday ? "#F0EBFF" : "transparent",
                    border: cell.isToday ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasSession ? `0 2px 0 rgba(0,0,0,0.1)` : "none",
                  }}
                >
                  {hasSession ? (
                    <span className="text-lg">{sticker.emoji}</span>
                  ) : (
                    <span className="text-[11px]" style={{ color: cell.isToday ? COLORS.primary : "#C0B8D0" }}>
                      {cell.day}
                    </span>
                  )}
                </div>
                {hasSession && (
                  <span className="text-[8px]" style={{ color: COLORS.textSub, fontFamily: "Fredoka" }}>
                    ★{session!.stars}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 월간 요약 */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.primary, fontFamily: "Fredoka" }}>{monthStars}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>별 모음</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: COLORS.mint, fontFamily: "Fredoka" }}>{monthCompleted}</span>
          <span className="text-[10px]" style={{ color: COLORS.textSub }}>완료 일수</span>
        </div>
      </div>

      {/* 일별 상세 */}
      <div className="space-y-2">
        {monthRecords.filter((r) => r.sessions.some((s) => s.profileId === profile.id)).reverse().map((record) => {
          const session = record.sessions.find((s) => s.profileId === profile.id)!;
          const sticker = getSticker(session.stars);
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
                  backgroundColor: sticker.color,
                  boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
                  transform: "rotate(-3deg)",
                }}
              >
                <span className="text-2xl">{sticker.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: COLORS.textDark }}>
                  {d.getDate()}일 ({WEEKDAY_SHORT[d.getDay()]})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(session.seconds)} · {sticker.label}
                </p>
              </div>
              {session.isAllClear && (
                <span
                  className="text-[10px] px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: COLORS.mint }}
                >
                  완료
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {monthSessions.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            {profile.name}의 이번 달 스티커가 없어요!
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
        <h1 className="text-lg" style={{ color: COLORS.primary }}>칭찬 스티커판</h1>
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
          <StickerBoardOverview routineFilter={routineFilter} />
        ) : (
          <PlayerStickerBoard
            profile={profiles.find((p) => p.id === activeTab) ?? profiles[0]}
            routineFilter={routineFilter}
          />
        )}
      </div>
    </div>
  );
}
