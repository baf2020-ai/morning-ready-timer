"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStatsStore } from "@/stores/useStatsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Character from "@/components/svg/characters/Character";
import type { PlayerProfile } from "@/lib/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];
  return `${month}/${day} (${weekday})`;
}

function getLast7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/** 전체 요약 탭 */
function OverviewTab() {
  const records = useStatsStore((s) => s.records);
  const streak = useStatsStore((s) => s.getStreak());
  const last7 = getLast7Days();

  const weekRecords = last7.map((date) => ({
    date,
    record: records.find((r) => r.date === date),
  }));

  const weeklyStars = weekRecords.reduce((sum, { record }) => sum + (record?.totalStars ?? 0), 0);
  const weeklyCompleted = weekRecords.filter(({ record }) => record?.isAllClear).length;
  const weeklyAvgTime = (() => {
    const completed = weekRecords.filter(({ record }) => record && record.totalSeconds > 0);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((sum, { record }) => sum + (record?.totalSeconds ?? 0), 0) / completed.length);
  })();

  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>연속 기록</p>
          <p className="text-2xl font-black" style={{ color: "#FF6B6B" }}>
            {streak > 0 ? `🔥 ${streak}` : "0"}
          </p>
          <p className="text-xs" style={{ color: "#636E72" }}>일</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>주간 별</p>
          <p className="text-2xl font-black" style={{ color: "#FFD43B" }}>
            ⭐ {weeklyStars}
          </p>
          <p className="text-xs" style={{ color: "#636E72" }}>개</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>완료율</p>
          <p className="text-2xl font-black" style={{ color: "#4ECDC4" }}>
            {weeklyCompleted}/7
          </p>
          <p className="text-xs" style={{ color: "#636E72" }}>일</p>
        </div>
      </div>

      {weeklyAvgTime > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>평균 준비 시간</p>
          <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
            {formatTime(weeklyAvgTime)}
          </p>
        </div>
      )}

      {/* 일별 기록 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>📅 이번 주</h2>
        <div className="space-y-2">
          {weekRecords.map(({ date, record }) => (
            <div
              key={date}
              className="flex items-center justify-between p-2 rounded-xl"
              style={{ backgroundColor: record?.isAllClear ? "#F0FFF4" : "#F8F8F8" }}
            >
              <span className="text-sm font-medium" style={{ color: "#2D3436" }}>
                {formatDate(date)}
              </span>
              {record ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "#636E72" }}>
                    {formatTime(record.totalSeconds)}
                  </span>
                  <span className="text-sm">
                    {"⭐".repeat(Math.min(record.totalStars, 6))}
                    {record.totalStars > 6 && ` +${record.totalStars - 6}`}
                  </span>
                  {record.isAllClear && <span className="text-sm">✅</span>}
                </div>
              ) : (
                <span className="text-xs" style={{ color: "#CCC" }}>기록 없음</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {records.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm" style={{ color: "#636E72" }}>
            아직 기록이 없어요!<br />등원 준비를 시작해보세요.
          </p>
        </div>
      )}
    </div>
  );
}

/** 플레이어별 탭 */
function PlayerTab({ profile }: { profile: PlayerProfile }) {
  const records = useStatsStore((s) => s.records);
  const last7 = getLast7Days();

  // 이 플레이어의 세션만 필터링
  const playerWeek = last7.map((date) => {
    const record = records.find((r) => r.date === date);
    const session = record?.sessions.find((s) => s.profileId === profile.id);
    return { date, session };
  });

  const totalStars = playerWeek.reduce((sum, { session }) => sum + (session?.stars ?? 0), 0);
  const completedDays = playerWeek.filter(({ session }) => session?.isAllClear).length;
  const avgTime = (() => {
    const played = playerWeek.filter(({ session }) => session && session.seconds > 0);
    if (played.length === 0) return 0;
    return Math.round(played.reduce((sum, { session }) => sum + (session?.seconds ?? 0), 0) / played.length);
  })();

  // 전체 누적
  const allSessions = records.flatMap((r) =>
    r.sessions.filter((s) => s.profileId === profile.id)
  );
  const lifetimeStars = allSessions.reduce((sum, s) => sum + s.stars, 0);
  const lifetimeCompleted = allSessions.filter((s) => s.isAllClear).length;
  const bestTime = allSessions.length > 0
    ? Math.min(...allSessions.filter((s) => s.seconds > 0).map((s) => s.seconds))
    : 0;

  return (
    <div className="space-y-5">
      {/* 캐릭터 + 이름 */}
      <div className="flex flex-col items-center gap-1">
        <Character type={profile.characterType} expression="happy" size={70} />
        <p className="text-lg font-bold" style={{ color: "#2D3436" }}>{profile.name}</p>
      </div>

      {/* 주간 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>주간 별</p>
          <p className="text-2xl font-black" style={{ color: "#FFD43B" }}>
            ⭐ {totalStars}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>완료</p>
          <p className="text-2xl font-black" style={{ color: "#4ECDC4" }}>
            {completedDays}/7
          </p>
          <p className="text-xs" style={{ color: "#636E72" }}>일</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs" style={{ color: "#636E72" }}>평균</p>
          <p className="text-lg font-black" style={{ color: "#2D3436" }}>
            {avgTime > 0 ? formatTime(avgTime) : "-"}
          </p>
        </div>
      </div>

      {/* 일별 기록 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>📅 이번 주</h2>
        <div className="space-y-2">
          {playerWeek.map(({ date, session }) => (
            <div
              key={date}
              className="flex items-center justify-between p-2 rounded-xl"
              style={{ backgroundColor: session?.isAllClear ? "#F0FFF4" : "#F8F8F8" }}
            >
              <span className="text-sm font-medium" style={{ color: "#2D3436" }}>
                {formatDate(date)}
              </span>
              {session ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "#636E72" }}>
                    {formatTime(session.seconds)}
                  </span>
                  <span className="text-sm">
                    {"⭐".repeat(Math.min(session.stars, 6))}
                    {session.stars > 6 && ` +${session.stars - 6}`}
                  </span>
                  {session.isAllClear && <span className="text-sm">✅</span>}
                </div>
              ) : (
                <span className="text-xs" style={{ color: "#CCC" }}>기록 없음</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 누적 기록 */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>🏆 전체 기록</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-xl bg-gray-50">
            <p className="text-xs" style={{ color: "#636E72" }}>누적 별</p>
            <p className="text-lg font-bold" style={{ color: "#FFD43B" }}>⭐ {lifetimeStars}</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50">
            <p className="text-xs" style={{ color: "#636E72" }}>완료 횟수</p>
            <p className="text-lg font-bold" style={{ color: "#4ECDC4" }}>✅ {lifetimeCompleted}</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50">
            <p className="text-xs" style={{ color: "#636E72" }}>최고 기록</p>
            <p className="text-lg font-bold" style={{ color: "#FF6B6B" }}>
              {bestTime > 0 && bestTime < Infinity ? formatTime(bestTime) : "-"}
            </p>
          </div>
        </div>
      </section>

      {allSessions.length === 0 && (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm" style={{ color: "#636E72" }}>
            {profile.name}의 기록이 아직 없어요!
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

  const tabs = [
    { id: "overview", label: "전체" },
    ...profiles.map((p) => ({ id: p.id, label: p.name })),
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FFF9E6" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: "#FFFFFF" }}>
        <button onClick={() => router.back()} className="text-sm" style={{ color: "#636E72" }}>
          ← 뒤로
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#2D3436" }}>📊 통계</h1>
        <div className="w-10" />
      </div>

      {/* 탭 바 */}
      <div className="flex border-b" style={{ backgroundColor: "#FFFFFF" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-sm font-medium text-center transition-colors relative"
            style={{
              color: activeTab === tab.id ? "#FF6B6B" : "#636E72",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full"
                style={{ backgroundColor: "#FF6B6B" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "overview" ? (
          <OverviewTab />
        ) : (
          <PlayerTab
            profile={profiles.find((p) => p.id === activeTab) ?? profiles[0]}
          />
        )}
      </div>
    </div>
  );
}
