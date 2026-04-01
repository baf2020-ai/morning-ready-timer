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

function adjustColorBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// 플레이어별 기본 버튼 색상
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

  const defaultColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  const playerColor = {
    bg: profile.bgColor ?? defaultColor.bg,
    shadow: profile.bgColor ? adjustColorBrightness(profile.bgColor, -30) : defaultColor.shadow,
  };

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

  const timerSize = compact ? 240 : 300;

  // 표시 중인 태스크가 실제 실행 중인지 판별
  const isDisplayedTaskRunning = player.isTimerRunning && player.activeRunningTaskIndex === player.currentTaskIndex;
  // 다른 태스크의 타이머가 백그라운드에서 실행 중인지
  const hasBackgroundTimer = player.isTimerRunning && player.activeRunningTaskIndex !== undefined && player.activeRunningTaskIndex !== player.currentTaskIndex;

  // ETA 계산
  const nextTask = tasks[player.currentTaskIndex + 1] ?? null;
  const remainingTasksDuration = tasks
    .slice(player.currentTaskIndex + 1)
    .reduce((sum, t) => sum + t.durationSeconds, 0);
  const totalRemaining = Math.max(remaining, 0) + remainingTasksDuration;
  const etaDate = new Date(Date.now() + totalRemaining * 1000);
  const etaHH = etaDate.getHours().toString().padStart(2, "0");
  const etaMM = etaDate.getMinutes().toString().padStart(2, "0");
  const totalMin = Math.ceil(totalRemaining / 60);

  // 전체 진행률
  const progressPercent = Math.round((player.results.length / tasks.length) * 100);

  return (
    <div className="relative flex flex-col h-full overflow-y-auto px-4 py-2 gap-2">

      {/* 1. 헤더: 아바타 + 이름 + 스텝 카운터 */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "#F5F0FF" }}
      >
        {/* 아바타 */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 overflow-hidden"
          style={{
            width: 44, height: 44,
            backgroundColor: playerColor.bg,
          }}
        >
          <Character type={profile.characterType} expression="happy" size={36} />
        </div>
        {/* 이름 + 서브 */}
        <div className="flex flex-col min-w-0">
          <p className="text-lg font-bold truncate" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
            {profile.name}
          </p>
          <p className="text-xs" style={{ color: COLORS.textSub }}>
            오늘의 루틴
          </p>
        </div>
        {/* 스텝 카운터 */}
        <span
          className="ml-auto text-sm px-3 py-1 rounded-full font-bold shrink-0"
          style={{ backgroundColor: "white", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` }}
        >
          {player.currentTaskIndex + 1} / {tasks.length}
        </span>
      </div>

      {/* 2. 타이머 카드 */}
      <motion.div
        key={currentTask.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-1 px-4 py-3 rounded-3xl"
        style={{
          backgroundColor: "white",
          boxShadow: "0 2px 16px rgba(108, 92, 231, 0.08)",
        }}
      >
        {/* 태스크 이름 (타이머 위) */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: playerColor.bg }}
          />
          <span className="text-base font-bold" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
            {currentTask.label}
          </span>
        </div>

        {/* 타이머 (변경 없음) */}
        <CountdownTimer
          totalSeconds={duration}
          remainingSeconds={remaining}
          size={timerSize}
          isPaused={!isDisplayedTaskRunning}
          onTimeClick={handleTimeClick}
        />

        {/* 제어 버튼: [-1] [시작/정지] [+1] */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAdjustTime(-60)}
            className="flex items-center justify-center rounded-full font-bold text-sm"
            style={{
              width: 44, height: 44,
              backgroundColor: "#F0EBFF",
              color: COLORS.primary,
            }}
          >
            -1
          </motion.button>

          {isDisplayedTaskRunning ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePauseTimer}
              className="flex items-center justify-center rounded-full px-6 py-2.5 font-bold text-white text-base"
              style={{ backgroundColor: COLORS.primary, minWidth: 110 }}
            >
              ⏸ 정지
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleStartTimer}
              className="flex items-center justify-center rounded-full px-6 py-2.5 font-bold text-white text-base"
              style={{
                backgroundColor: hasBackgroundTimer ? COLORS.secondary : COLORS.primary,
                minWidth: 110,
              }}
            >
              ▶ 시작
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAdjustTime(60)}
            className="flex items-center justify-center rounded-full font-bold text-sm"
            style={{
              width: 44, height: 44,
              backgroundColor: "#F0EBFF",
              color: COLORS.primary,
            }}
          >
            +1
          </motion.button>
        </div>
      </motion.div>

      {/* 3. 완료 버튼 */}
      <motion.button
        whileTap={{ scale: 0.95, rotate: -1 }}
        onClick={handleComplete}
        className="jelly-btn w-full max-w-[280px] py-3 text-xl text-white font-bold mx-auto my-2"
        style={{
          backgroundColor: playerColor.bg,
          "--btn-shadow": playerColor.shadow,
          minHeight: "64px",
        } as React.CSSProperties}
      >
        완료!
      </motion.button>

      {/* 4. 정보 카드: 예상 완료 + 다음 할 일 */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "#F5F0FF" }}
      >
        {/* 예상 완료 */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold text-white"
            style={{ backgroundColor: COLORS.mint }}
          >
            완료
          </span>
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: COLORS.textSub }}>예상 완료</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold" style={{ color: COLORS.textDark, fontFamily: "Fredoka, sans-serif" }}>
                {etaHH}:{etaMM}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ backgroundColor: "#E8E0F0", color: COLORS.textSub }}
              >
                {totalMin}분
              </span>
            </div>
          </div>
        </div>

        {/* 구분선 + 다음 */}
        {nextTask && (
          <>
            <span
              className="text-xs px-2 py-0.5 rounded font-bold text-white shrink-0"
              style={{ backgroundColor: COLORS.primary }}
            >
              다음
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs" style={{ color: COLORS.textSub }}>다음 할 일</span>
              <span className="text-sm font-bold truncate" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
                {nextTask.label} ({Math.floor(nextTask.durationSeconds / 60)}분)
              </span>
            </div>
          </>
        )}
      </div>

      {/* 5. 진행 상황 (변경 없음) */}
      <div className="flex flex-col gap-2 px-2">
        {/* 스텝 아이콘 (기존 ProgressSteps 유지) */}
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
