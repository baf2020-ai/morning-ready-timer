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

// 요일 이름
const WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

function getLast7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      day: d.getDate(),
      weekday: WEEKDAY_SHORT[d.getDay()],
      isToday: i === 6,
    };
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

/** 칭찬 스티커판 - 전체 */
function StickerBoardOverview({ routineFilter }: { routineFilter: RoutineType }) {
  const allRecords = useStatsStore((s) => s.records);
  const streak = useStatsStore((s) => s.getStreak());
  const last7 = getLast7Days();

  // 루틴 필터: routineType이 없는 기존 기록은 morning으로 간주
  const records = allRecords.filter((r) => (r.routineType ?? "morning") === routineFilter);

  const weekRecords = last7.map((d) => ({
    ...d,
    record: records.find((r) => r.date === d.dateStr),
  }));

  const weeklyStars = weekRecords.reduce((sum, { record }) => sum + (record?.totalStars ?? 0), 0);

  return (
    <div className="space-y-5">

      {/* 연속 기록 배지 */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="flex items-center justify-center gap-2 py-3"
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

      {/* 이번 주 스티커판 */}
      <div
        className="rounded-3xl p-4"
        style={{
          backgroundColor: "#FFFDF5",
          border: "3px solid #FDCB6E",
          boxShadow: "0 4px 0 #E5B85C",
        }}
      >
        <h2 className="text-center text-base mb-4" style={{ color: COLORS.textDark }}>
          이번 주 칭찬 스티커
        </h2>

        {/* 7일 스티커 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {/* 요일 헤더 */}
          {weekRecords.map(({ dateStr, weekday }) => (
            <div key={`head-${dateStr}`} className="text-center">
              <span className="text-[10px]" style={{ color: COLORS.textSub }}>{weekday}</span>
            </div>
          ))}

          {/* 스티커 칸 */}
          {weekRecords.map(({ dateStr, day, record, isToday }, i) => {
            const sticker = getSticker(record?.totalStars ?? 0);
            const hasRecord = !!record;

            return (
              <motion.div
                key={dateStr}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
                className="flex flex-col items-center"
              >
                {/* 스티커 원 */}
                <div
                  className="relative flex items-center justify-center rounded-2xl"
                  style={{
                    width: 42,
                    height: 42,
                    backgroundColor: hasRecord ? sticker.color : "#F5F0FF",
                    border: isToday ? `3px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasRecord ? `0 2px 0 rgba(0,0,0,0.1)` : "none",
                    transform: hasRecord ? `rotate(${(i % 3 - 1) * 3}deg)` : "none",
                  }}
                >
                  {hasRecord ? (
                    <span className="text-xl">{sticker.emoji}</span>
                  ) : (
                    <span className="text-xs" style={{ color: "#D0C8E0" }}>{day}</span>
                  )}
                </div>
                {/* 별 개수 */}
                {hasRecord && (
                  <span className="text-[9px] mt-0.5" style={{ color: COLORS.textSub, fontFamily: "Fredoka" }}>
                    ★{record!.totalStars}
                  </span>
                )}
              </motion.div>
            );
          })}
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

      {/* 일별 스티커 상세 */}
      <div className="space-y-2">
        {weekRecords.filter(({ record }) => !!record).reverse().map(({ dateStr, day, weekday, record }) => {
          const sticker = getSticker(record!.totalStars);
          return (
            <motion.div
              key={dateStr}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ backgroundColor: "white", border: "2px solid #F0EBFF" }}
            >
              {/* 스티커 */}
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
              {/* 날짜 + 정보 */}
              <div className="flex-1">
                <p className="text-sm" style={{ color: COLORS.textDark }}>
                  {day}일 ({weekday})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(record!.totalSeconds)} · {sticker.label}
                </p>
              </div>
              {/* 완료 뱃지 */}
              {record!.isAllClear && (
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

      {records.length === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            아직 스티커가 없어요!<br />{routineFilter === "morning" ? "등원" : "잠자리"} 준비를 완료하면 스티커를 받을 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}

/** 칭찬 스티커판 - 개인별 */
function PlayerStickerBoard({ profile, routineFilter }: { profile: { id: string; name: string; characterType: "bunny" | "bear" | "cat" | "penguin" }; routineFilter: RoutineType }) {
  const allRecords = useStatsStore((s) => s.records);
  const last7 = getLast7Days();

  const records = allRecords.filter((r) => (r.routineType ?? "morning") === routineFilter);

  const playerWeek = last7.map((d) => {
    const record = records.find((r) => r.date === d.dateStr);
    const session = record?.sessions.find((s) => s.profileId === profile.id);
    return { ...d, session };
  });

  const totalStars = playerWeek.reduce((sum, { session }) => sum + (session?.stars ?? 0), 0);
  const completedDays = playerWeek.filter(({ session }) => session?.isAllClear).length;

  const allSessions = records.flatMap((r) =>
    r.sessions.filter((s) => s.profileId === profile.id)
  );
  const lifetimeStars = allSessions.reduce((sum, s) => sum + s.stars, 0);
  const lifetimeCompleted = allSessions.filter((s) => s.isAllClear).length;
  const positiveSessions = allSessions.filter((s) => s.seconds > 0);
  const bestTime = positiveSessions.length > 0
    ? Math.min(...positiveSessions.map((s) => s.seconds))
    : 0;

  return (
    <div className="space-y-5">
      {/* 캐릭터 프로필 */}
      <div className="flex flex-col items-center gap-1">
        <div className="char-idle">
          <Character type={profile.characterType} expression="happy" size={70} />
        </div>
        <p className="text-lg" style={{ color: COLORS.primary }}>{profile.name}</p>
      </div>

      {/* 이번 주 스티커판 */}
      <div
        className="rounded-3xl p-4"
        style={{
          backgroundColor: "#FFFDF5",
          border: "3px solid #FDCB6E",
          boxShadow: "0 4px 0 #E5B85C",
        }}
      >
        <h2 className="text-center text-sm mb-3" style={{ color: COLORS.textSub }}>
          {profile.name}의 스티커판
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {playerWeek.map(({ dateStr, weekday }) => (
            <div key={`head-${dateStr}`} className="text-center">
              <span className="text-[10px]" style={{ color: COLORS.textSub }}>{weekday}</span>
            </div>
          ))}

          {playerWeek.map(({ dateStr, day, session, isToday }, i) => {
            const sticker = getSticker(session?.stars ?? 0);
            const hasSession = !!session;

            return (
              <motion.div
                key={dateStr}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
                className="flex flex-col items-center"
              >
                <div
                  className="relative flex items-center justify-center rounded-2xl"
                  style={{
                    width: 42,
                    height: 42,
                    backgroundColor: hasSession ? sticker.color : "#F5F0FF",
                    border: isToday ? `3px solid ${COLORS.primary}` : "2px solid transparent",
                    boxShadow: hasSession ? `0 2px 0 rgba(0,0,0,0.1)` : "none",
                    transform: hasSession ? `rotate(${(i % 3 - 1) * 3}deg)` : "none",
                  }}
                >
                  {hasSession ? (
                    <span className="text-xl">{sticker.emoji}</span>
                  ) : (
                    <span className="text-xs" style={{ color: "#D0C8E0" }}>{day}</span>
                  )}
                </div>
                {hasSession && (
                  <span className="text-[9px] mt-0.5" style={{ color: COLORS.textSub, fontFamily: "Fredoka" }}>
                    ★{session!.stars}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* 일별 스티커 상세 */}
      <div className="space-y-2">
        {playerWeek.filter(({ session }) => !!session).reverse().map(({ dateStr, day, weekday, session }) => {
          const sticker = getSticker(session!.stars);
          return (
            <motion.div
              key={dateStr}
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
                  {day}일 ({weekday})
                </p>
                <p className="text-xs" style={{ color: COLORS.textSub }}>
                  {formatTime(session!.seconds)} · {sticker.label}
                </p>
              </div>
              {session!.isAllClear && (
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

      {allSessions.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: COLORS.textSub }}>
            {profile.name}의 스티커가 아직 없어요!
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
