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

interface PlayerPanelProps {
  playerIndex: number;
  compact?: boolean;
}

export default function PlayerPanel({ playerIndex, compact }: PlayerPanelProps) {
  const session = useGameStore((s) => s.session);
  const now = useGameStore((s) => s.now);
  const completeTask = useGameStore((s) => s.completeTask);
  const getRemainingSeconds = useGameStore((s) => s.getRemainingSeconds);
  const profiles = useSettingsStore((s) => s.settings.profiles);
  void now;

  const handleComplete = useCallback(() => {
    soundManager.play("tap");
    completeTask(playerIndex);
  }, [completeTask, playerIndex]);

  if (!session || !session.players[playerIndex] || profiles.length === 0) return null;

  const player = session.players[playerIndex];
  const profile = profiles.find((p) => p.id === player.profileId) ?? profiles[0];
  const currentTask = session.tasks[player.currentTaskIndex];
  if (!currentTask && !player.isCompleted) return null;
  const nextTask = session.tasks[player.currentTaskIndex + 1] ?? null;
  const remaining = getRemainingSeconds(playerIndex);

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

  const timerSize = compact ? 130 : 170;

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-2 gap-1">

      {/* 1. 상단: 이름 + 현재 태스크 */}
      <div className="flex items-center gap-2 mb-1">
        <p className={`${compact ? "text-sm" : "text-base"}`} style={{ color: COLORS.primary }}>
          {profile.name}
        </p>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0EBFF", color: COLORS.textSub }}>
          {player.currentTaskIndex + 1}/{session.tasks.length}
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
        <TaskIcon icon={currentTask.icon} size={compact ? 32 : 40} />
        <h2 className={compact ? "text-base" : "text-lg"} style={{ color: COLORS.textDark }}>
          {currentTask.label}
        </h2>
      </motion.div>

      {/* 4. 완료 버튼 */}
      <motion.button
        whileTap={{ scale: 0.88, rotate: -2 }}
        onClick={handleComplete}
        className="jelly-btn w-full max-w-[240px] py-3 text-lg text-white mt-3"
        style={{
          backgroundColor: COLORS.primary,
          "--btn-shadow": "#5041C0",
          minHeight: "56px",
        } as React.CSSProperties}
      >
        완료!
      </motion.button>

      {/* 5. 다음 항목 */}
      {nextTask && (
        <p className="text-xs mt-2" style={{ color: COLORS.textSub }}>
          다음: {nextTask.label} ({Math.floor(nextTask.durationSeconds / 60)}분)
        </p>
      )}

      {/* 6. 스텝 진행 상태 */}
      <div className="w-full flex flex-col items-center mt-2">
        <ProgressSteps
          tasks={session.tasks}
          currentStep={player.currentTaskIndex}
          compact={compact}
        />
      </div>
    </div>
  );
}
