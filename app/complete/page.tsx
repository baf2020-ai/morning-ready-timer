"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/useGameStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Confetti from "@/components/gamification/Confetti";
import Character from "@/components/svg/characters/Character";
import { COLORS, PRAISE_MESSAGES, ROUTINE_THEME } from "@/lib/constants";
import { useMemo } from "react";

function formatTotalTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

export default function CompletePage() {
  const router = useRouter();
  const session = useGameStore((s) => s.session);
  const resetGame = useGameStore((s) => s.resetGame);
  const streak = useStatsStore((s) => s.getStreak());
  const profiles = useSettingsStore((s) => s.settings.profiles);

  const routineType = session?.routineType ?? "morning";
  const theme = ROUTINE_THEME[routineType];
  const messages = PRAISE_MESSAGES[routineType];

  const praise = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    [messages]
  );

  const handleHome = () => {
    resetGame();
    router.push("/");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <button onClick={handleHome} className="text-lg" style={{ color: COLORS.textSub }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const totalStars = session.players.reduce(
    (sum, p) => sum + p.results.reduce((s, r) => s + r.stars, 0),
    0
  );
  const totalSeconds = session.players.reduce(
    (sum, p) => sum + p.results.reduce((s, r) => s + r.elapsedSeconds, 0),
    0
  );

  // 플레이어별 캐릭터 타입 가져오기
  const playerProfiles = session.players.map(
    (p) => profiles.find((pr) => pr.id === p.profileId) ?? profiles[0]
  );

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-5 px-6 paper-bg"
      style={{ backgroundColor: COLORS.bgLight }}
    >
      <Confetti />

      {/* 무지개 아치 배경 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] opacity-20 pointer-events-none">
        <svg viewBox="0 0 300 150" fill="none">
          {["#E84393", "#FFAD42", "#00B894", "#54A0FF", "#6C5CE7"].map((color, i) => (
            <path
              key={i}
              d={`M ${20 + i * 8} 150 A ${130 - i * 8} ${130 - i * 8} 0 0 1 ${280 - i * 8} 150`}
              stroke={color}
              strokeWidth="8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* 캐릭터들이 점프! */}
      <div className="flex gap-4">
        {playerProfiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: [100, -20, 10, -5, 0], opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="char-idle"
          >
            <Character type={profile.characterType} expression="excited" size={90} />
          </motion.div>
        ))}
      </div>

      {/* 칭찬 말풍선 */}
      <motion.div
        initial={{ scale: 0, rotate: -5 }}
        animate={{ scale: 1, rotate: 2 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }}
        className="relative px-6 py-3 rounded-2xl"
        style={{ backgroundColor: COLORS.primary }}
      >
        <p className="text-2xl text-white text-center">{praise}</p>
        {/* 말풍선 꼬리 */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
          style={{ backgroundColor: COLORS.primary }}
        />
      </motion.div>

      {/* 결과 카드 */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="sticker-card p-5 text-center w-full max-w-xs"
        style={{ transform: "rotate(-1deg)" }}
      >
        <div className="flex flex-col gap-3">
          {/* 별 */}
          <div>
            <p className="text-sm" style={{ color: COLORS.textSub }}>오늘의 별</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={COLORS.secondary} stroke="#E09030" strokeWidth="1" />
              </svg>
              <span className="text-3xl" style={{ color: COLORS.primary, fontFamily: "Fredoka" }}>
                {totalStars}
              </span>
            </div>
          </div>

          {/* 시간 */}
          <div style={{ borderTop: `2px solid #F0EBFF`, paddingTop: 12 }}>
            <p className="text-sm" style={{ color: COLORS.textSub }}>총 시간</p>
            <p className="text-xl" style={{ color: COLORS.textDark, fontFamily: "Fredoka" }}>
              {formatTotalTime(totalSeconds)}
            </p>
          </div>

          {/* 연속 기록 */}
          {streak > 0 && (
            <div style={{ borderTop: `2px solid #F0EBFF`, paddingTop: 12 }}>
              <p className="text-sm" style={{ color: COLORS.textSub }}>연속 기록</p>
              <p className="text-xl" style={{ color: COLORS.accent }}>
                {streak}일 연속!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 홈 버튼 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.9, rotate: -2 }}
        onClick={handleHome}
        className="jelly-btn px-8 py-4 text-lg text-white"
        style={{
          backgroundColor: COLORS.mint,
          "--btn-shadow": "#009B7D",
        } as React.CSSProperties}
      >
        처음으로
      </motion.button>
    </div>
  );
}
