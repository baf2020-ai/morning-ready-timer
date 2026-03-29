"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/useGameStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import CountdownTimer from "@/components/timer/CountdownTimer";
import TaskIcon from "@/components/svg/icons/TaskIcons";
import ProgressSteps from "@/components/timer/ProgressSteps";
import Character from "@/components/svg/characters/Character";
import { COLORS } from "@/lib/constants";
import { soundManager } from "@/lib/sounds";

// 플레이어별 버튼 색상
const PLAYER_COLORS = [
  { bg: COLORS.primary, shadow: "#5041C0" },      // 보라
  { bg: COLORS.accent, shadow: "#C0306E" },        // 핑크
] as const;

interface PlayerPanelProps {
  playerIndex: number;
  compact?: boolean;
}

export default function PlayerPanel({ playerIndex, compact }: PlayerPanelProps) {
  const session = useGameStore((s) => s.session);
  const now = useGameStore((s) => s.now);
  const completeTask = useGameStore((s) => s.completeTask);
  const getRemainingSeconds = useGameStore((s) => s.getRemainingSeconds);
  const getPlayerTasks = useGameStore((s) => s.getPlayerTasks);
  const profiles = useSettingsStore((s) => s.settings.profiles);
  void now;

  const handleComplete = useCallback(() => {
    soundManager.play("tap");
    completeTask(playerIndex);
  }, [completeTask, playerIndex]);

  if (!session || !session.players[playerIndex] || profiles.length === 0) return null;

  const player = session.players[playerIndex];
  const profile = profiles.find((p) => p.id === player.profileId) ?? profiles[0];
  const tasks = getPlayerTasks(playerIndex);
  const currentTask = tasks[player.currentTaskIndex];
  if (!currentTask && !player.isCompleted) return null;
  const nextTask = tasks[player.currentTaskIndex + 1] ?? null;
  const remaining = getRemainingSeconds(playerIndex);

  const playerColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

  if (player.isCompleted) {
    const totalStars = player.results.reduce((sum, r) => sum + r.stars, 0);
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="char-idle"
        >
          <Character type={profile.characterType} expression="excited" size={80} />
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg"
          style={{ color: COLORS.textDark }}
        >
          {profile.name} 완료!
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="flex items-center gap-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={COLORS.secondary} stroke="#E09030" strokeWidth="1" />
          </svg>
          <span className="text-2xl" style={{ color: COLORS.primary, fontFamily: "Fredoka" }}>
            {totalStars}
          </span>
        </motion.div>
      </div>
    );
  }

  const timerSize = compact ? 220 : 280;

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-2 gap-1">

      {/* 1. 상단: 이름 + 현재 태스크 */}
      <div className="flex items-center gap-3 mb-2">
        <p className={`font-bold ${compact ? "text-2xl" : "text-3xl"}`} style={{ color: playerColor.bg, fontFamily: "Jua, sans-serif" }}>
          {profile.name}
        </p>
        <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "#F0EBFF", color: COLORS.textSub }}>
          {player.currentTaskIndex + 1}/{tasks.length}
        </span>
      </div>

      {/* 2. 타이머 (가장 크게, 화면 중심) */}
      <motion.div
        key={currentTask.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center"
      >
        <CountdownTimer
          totalSeconds={currentTask.durationSeconds}
          remainingSeconds={remaining}
          size={timerSize}
        />
      </motion.div>

      {/* 3. 태스크 아이콘 + 이름 (타이머 바로 아래) */}
      <motion.div
        key={`task-${currentTask.id}`}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 mt-1"
      >
        <TaskIcon icon={currentTask.icon} size={compact ? 40 : 52} />
        <h2 className={compact ? "text-lg" : "text-xl"} style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
          {currentTask.label}
        </h2>
      </motion.div>

      {/* 4. 완료 버튼 - 플레이어별 색상 */}
      <motion.button
        whileTap={{ scale: 0.88, rotate: -2 }}
        onClick={handleComplete}
        className="jelly-btn w-full max-w-[280px] py-4 text-xl text-white mt-3 font-bold"
        style={{
          backgroundColor: playerColor.bg,
          "--btn-shadow": playerColor.shadow,
          minHeight: "64px",
        } as React.CSSProperties}
      >
        완료!
      </motion.button>

      {/* 5. 예상 완료 시간 + 다음 항목 */}
      {(() => {
        // 현재 태스크 남은 시간 + 이후 태스크들의 총 시간
        const remainingTasksDuration = tasks
          .slice(player.currentTaskIndex + 1)
          .reduce((sum, t) => sum + t.durationSeconds, 0);
        const totalRemaining = Math.max(remaining, 0) + remainingTasksDuration;
        const etaDate = new Date(Date.now() + totalRemaining * 1000);
        const etaHH = etaDate.getHours().toString().padStart(2, "0");
        const etaMM = etaDate.getMinutes().toString().padStart(2, "0");
        const totalMin = Math.ceil(totalRemaining / 60);
        return (
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-base font-bold" style={{ color: COLORS.mint }}>
              예상 완료 {etaHH}:{etaMM} ({totalMin}분 남음)
            </p>
            {nextTask && (
              <p className="text-sm" style={{ color: COLORS.textSub }}>
                다음: {nextTask.label} ({Math.floor(nextTask.durationSeconds / 60)}분)
              </p>
            )}
          </div>
        );
      })()}

      {/* 6. 스텝 진행 상태 */}
      <div className="w-full flex flex-col items-center mt-2">
        <ProgressSteps
          tasks={tasks}
          currentStep={player.currentTaskIndex}
          compact={compact}
        />
      </div>
    </div>
  );
}
