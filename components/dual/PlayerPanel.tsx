"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const getTaskDuration = useGameStore((s) => s.getTaskDuration);
  const startTimer = useGameStore((s) => s.startTimer);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const goToTask = useGameStore((s) => s.goToTask);
  const adjustTime = useGameStore((s) => s.adjustTime);
  const setDuration = useGameStore((s) => s.setDuration);
  const profiles = useSettingsStore((s) => s.settings.profiles);
  void now;

  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [editMinutes, setEditMinutes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTimeClick = useCallback(() => {
    soundManager.play("tap");
    const dur = getTaskDuration(playerIndex);
    setEditMinutes(Math.round(dur / 60));
    setShowTimeEditor(true);
  }, [getTaskDuration, playerIndex]);

  const handleTimeConfirm = useCallback(() => {
    const newSeconds = Math.max(1, editMinutes) * 60;
    setDuration(playerIndex, newSeconds);
    setShowTimeEditor(false);
  }, [editMinutes, setDuration, playerIndex]);

  // 에디터 열릴 때 input 포커스
  useEffect(() => {
    if (showTimeEditor && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showTimeEditor]);

  const handleComplete = useCallback(() => {
    soundManager.play("tap");
    completeTask(playerIndex);
  }, [completeTask, playerIndex]);

  const handleStartTimer = useCallback(() => {
    soundManager.play("tap");
    startTimer(playerIndex);
  }, [startTimer, playerIndex]);

  const handlePauseTimer = useCallback(() => {
    soundManager.play("tap");
    pauseTimer(playerIndex);
  }, [pauseTimer, playerIndex]);

  const handleAdjustTime = useCallback((delta: number) => {
    soundManager.play("tap");
    adjustTime(playerIndex, delta);
  }, [adjustTime, playerIndex]);

  const handleStepClick = useCallback((stepIndex: number) => {
    soundManager.play("tap");
    goToTask(playerIndex, stepIndex);
  }, [goToTask, playerIndex]);

  if (!session || !session.players[playerIndex] || profiles.length === 0) return null;

  const player = session.players[playerIndex];
  const profile = profiles.find((p) => p.id === player.profileId) ?? profiles[0];
  const tasks = getPlayerTasks(playerIndex);
  const currentTask = tasks[player.currentTaskIndex];
  if (!currentTask && !player.isCompleted) return null;
  const remaining = getRemainingSeconds(playerIndex);
  const duration = getTaskDuration(playerIndex);

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
    <div className="relative flex flex-col items-center justify-center h-full px-3 py-2 gap-1">

      {/* 1. 상단: 이름 + 현재 태스크 */}
      <div className="flex items-center gap-3 mb-2">
        <p className={`font-bold ${compact ? "text-2xl" : "text-3xl"}`} style={{ color: playerColor.bg, fontFamily: "Jua, sans-serif" }}>
          {profile.name}
        </p>
        <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "#F0EBFF", color: COLORS.textSub }}>
          {player.currentTaskIndex + 1}/{tasks.length}
        </span>
      </div>

      {/* 2. 타이머 */}
      <motion.div
        key={currentTask.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center"
      >
        <CountdownTimer
          totalSeconds={duration}
          remainingSeconds={remaining}
          size={timerSize}
          isPaused={!player.isTimerRunning}
          onTimeClick={handleTimeClick}
        />
      </motion.div>

      {/* 3. 제어 버튼: [-1분] [시작/정지] [+1분] */}
      <div className="flex items-center gap-3 mt-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAdjustTime(-60)}
          className="flex items-center justify-center rounded-full font-bold text-sm"
          style={{
            width: 40, height: 40,
            backgroundColor: "#F0EBFF",
            color: COLORS.primary,
          }}
        >
          -1
        </motion.button>

        {player.isTimerRunning ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePauseTimer}
            className="flex items-center justify-center rounded-full px-5 py-2 font-bold text-white text-base"
            style={{ backgroundColor: COLORS.primary, minWidth: 100 }}
          >
            ⏸ 정지
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleStartTimer}
            className="flex items-center justify-center rounded-full px-5 py-2 font-bold text-white text-base"
            style={{ backgroundColor: COLORS.mint, minWidth: 100 }}
          >
            ▶ 시작
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAdjustTime(60)}
          className="flex items-center justify-center rounded-full font-bold text-sm"
          style={{
            width: 40, height: 40,
            backgroundColor: "#F0EBFF",
            color: COLORS.primary,
          }}
        >
          +1
        </motion.button>
      </div>

      {/* 4. 태스크 아이콘 + 이름 */}
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

      {/* 5. 완료 버튼 */}
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

      {/* 6. 예상 완료 시간 + 다음 항목 */}
      {(() => {
        const nextTask = tasks[player.currentTaskIndex + 1] ?? null;
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

      {/* 7. 스텝 진행 상태 (클릭으로 이동) */}
      <div className="w-full flex flex-col items-center mt-2">
        <ProgressSteps
          tasks={tasks}
          currentStep={player.currentTaskIndex}
          completedCount={player.results.length}
          compact={compact}
          onStepClick={handleStepClick}
        />
      </div>

      {/* 시간 설정 모달 */}
      <AnimatePresence>
        {showTimeEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowTimeEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="sticker-card p-6 flex flex-col items-center gap-4"
              style={{ minWidth: 240 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg font-bold" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
                시간 설정 (분)
              </p>
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditMinutes((m) => Math.max(1, m - 1))}
                  className="flex items-center justify-center rounded-full font-bold text-lg"
                  style={{ width: 44, height: 44, backgroundColor: "#F0EBFF", color: COLORS.primary }}
                >
                  -
                </motion.button>
                <input
                  ref={inputRef}
                  type="number"
                  min={1}
                  max={120}
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTimeConfirm(); }}
                  className="text-center text-3xl font-bold rounded-xl border-2 outline-none"
                  style={{
                    width: 80,
                    height: 56,
                    borderColor: COLORS.primary,
                    color: COLORS.textDark,
                    fontFamily: "Fredoka, sans-serif",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditMinutes((m) => Math.min(120, m + 1))}
                  className="flex items-center justify-center rounded-full font-bold text-lg"
                  style={{ width: 44, height: 44, backgroundColor: "#F0EBFF", color: COLORS.primary }}
                >
                  +
                </motion.button>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowTimeEditor(false)}
                  className="flex-1 py-2.5 rounded-full font-bold text-base"
                  style={{ backgroundColor: "#F0EBFF", color: COLORS.textSub }}
                >
                  취소
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTimeConfirm}
                  className="flex-1 py-2.5 rounded-full font-bold text-base text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  확인
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
