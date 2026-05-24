"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/useGameStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Confetti from "@/components/gamification/Confetti";
import AppleTreeReward, { type AppleRewardKind } from "@/components/gamification/AppleTreeReward";
import Character from "@/components/svg/characters/Character";
import { COLORS, PRAISE_MESSAGES } from "@/lib/constants";
import { didSessionMissDeadline } from "@/lib/sessionOutcome";
import { useIsTablet } from "@/lib/useMediaQuery";
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
  const isTablet = useIsTablet();

  const routineType = session?.routineType ?? "morning";
  const messages = PRAISE_MESSAGES[routineType];
  const praiseSeed = `${routineType}-${session?.players.map((p) => `${p.profileId}:${p.results.length}`).join("|") ?? "empty"}`;

  const praise = useMemo(
    () => {
      const seed = praiseSeed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return messages[seed % messages.length];
    },
    [messages, praiseSeed]
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

  const totalSeconds = session.players.reduce(
    (sum, p) => sum + p.results.reduce((s, r) => s + r.elapsedSeconds, 0),
    0
  );
  const missedDeadline = didSessionMissDeadline(session);
  const rewardKind: AppleRewardKind = missedDeadline ? "fall" : "grow";
  const resultMessage = missedDeadline ? "조금 늦었지만 끝까지 해냈어" : praise;
  const resultColor = missedDeadline ? COLORS.accent : COLORS.primary;

  // 플레이어별 캐릭터 타입 가져오기
  const playerProfiles = session.players.map(
    (p) => profiles.find((pr) => pr.id === p.profileId) ?? profiles[0]
  );

  return (
    <div
      className="relative flex h-full flex-col items-center gap-4 md:gap-6 overflow-y-auto px-4 md:px-8 py-5 md:py-8 paper-bg"
      style={{ backgroundColor: COLORS.bgLight }}
    >
      {!missedDeadline && <Confetti />}

      {/* 캐릭터들이 점프! */}
      <div className="flex gap-3 md:gap-6 pt-1 md:pt-2">
        {playerProfiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: [100, -20, 10, -5, 0], opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="char-idle"
          >
            <Character
              type={profile.characterType}
              expression={missedDeadline ? "worried" : "excited"}
              size={isTablet ? 104 : 64}
            />
          </motion.div>
        ))}
      </div>

      {/* 칭찬 말풍선 */}
      <motion.div
        initial={{ scale: 0, rotate: -5 }}
        animate={{ scale: 1, rotate: 2 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }}
        className="relative px-5 md:px-8 py-2 md:py-3 rounded-2xl"
        style={{ backgroundColor: resultColor }}
      >
        <p className="text-xl md:text-3xl text-white text-center">{resultMessage}</p>
        {/* 말풍선 꼬리 */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
          style={{ backgroundColor: resultColor }}
        />
      </motion.div>

      {/* 결과 카드 */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-4xl"
      >
        <AppleTreeReward
          appleCount={rewardKind === "grow" ? 1 : 0}
          fallenCount={rewardKind === "fall" ? 1 : 0}
          sequence={[rewardKind]}
          className="rounded-lg shadow-[0_10px_30px_rgba(108,92,231,0.12)]"
        />
      </motion.div>

      {/* 결과 요약 */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.15 }}
        className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-center"
      >
        <div>
          <p className="text-xs md:text-sm" style={{ color: COLORS.textSub }}>
            {missedDeadline ? "떨어진 사과" : "오늘 열린 사과"}
          </p>
          <p className="text-lg md:text-2xl" style={{ color: resultColor, fontFamily: "Fredoka" }}>
            1개
          </p>
        </div>

        <div>
          <p className="text-xs md:text-sm" style={{ color: COLORS.textSub }}>결과</p>
          <p className="text-lg md:text-2xl" style={{ color: resultColor }}>
            {missedDeadline ? "조금 늦음" : "시간 안 성공"}
          </p>
        </div>

        <div>
          <p className="text-xs md:text-sm" style={{ color: COLORS.textSub }}>총 시간</p>
          <p className="text-lg md:text-2xl" style={{ color: COLORS.textDark, fontFamily: "Fredoka" }}>
            {formatTotalTime(totalSeconds)}
          </p>
        </div>

        {streak > 0 && (
          <div>
            <p className="text-xs md:text-sm" style={{ color: COLORS.textSub }}>연속 기록</p>
            <p className="text-lg md:text-2xl" style={{ color: COLORS.mint }}>
              {streak}일
            </p>
          </div>
        )}
      </motion.div>

      {/* 홈 버튼 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.35 }}
        whileTap={{ scale: 0.9, rotate: -2 }}
        onClick={handleHome}
        className="jelly-btn px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl text-white"
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
