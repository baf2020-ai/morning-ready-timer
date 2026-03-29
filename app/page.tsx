"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Character from "@/components/svg/characters/Character";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useGameStore } from "@/stores/useGameStore";
import { soundManager } from "@/lib/sounds";
import { COLORS, ROUTINE_THEME } from "@/lib/constants";
import { SunIcon, MoonIcon } from "@/components/svg/icons/RoutineIcons";
import type { PlayerProfile, RoutineType } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { settings, getTasksForProfile } = useSettingsStore();
  const startGame = useGameStore((s) => s.startGame);
  const profiles = settings.profiles;
  const [routine, setRoutine] = useState<RoutineType>("morning");

  const theme = ROUTINE_THEME[routine];

  const handleSoloStart = async (profile: PlayerProfile) => {
    await soundManager.init();
    soundManager.play("tap");
    const tasks = getTasksForProfile(profile.id, routine);
    startGame("solo", [tasks], [profile], routine);
    router.push(`/play?mode=solo&routine=${routine}`);
  };

  const handleDualStart = async () => {
    await soundManager.init();
    soundManager.play("tap");
    const playerTasks = profiles.map((p) => getTasksForProfile(p.id, routine));
    startGame("dual", playerTasks, profiles, routine);
    router.push(`/play?mode=dual&routine=${routine}`);
  };

  const isMorning = routine === "morning";

  return (
    <div
      className={`flex flex-col items-center justify-center h-full gap-5 px-6 paper-bg overflow-hidden ${theme.bgClass}`}
    >
      {/* 루틴 모드 선택 탭 */}
      <div
        className="flex rounded-full p-1"
        style={{ backgroundColor: "rgba(108,92,231,0.08)" }}
      >
        {(["morning", "bedtime"] as RoutineType[]).map((r) => (
          <button
            key={r}
            onClick={() => setRoutine(r)}
            className="px-5 py-2 rounded-full text-sm transition-all"
            style={{
              backgroundColor: routine === r ? (r === "morning" ? COLORS.secondary : "#7C6CDB") : "transparent",
              color: routine === r ? "white" : COLORS.textSub,
              boxShadow: routine === r ? `0 2px 0 ${r === "morning" ? "#E09030" : "#5041C0"}` : "none",
            }}
          >
            <span className="flex items-center gap-1">{r === "morning" ? <><SunIcon size={14} /> 등원 준비</> : <><MoonIcon size={14} /> 잠자리 준비</>}</span>
          </button>
        ))}
      </div>

      {/* 타이틀 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={routine}
          initial={{ y: -20, opacity: 0, rotate: -3 }}
          animate={{ y: 0, opacity: 1, rotate: -2 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: isMorning ? COLORS.primary : "#7C6CDB" }}
          >
            {theme.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.textSub }}>
            {theme.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 혼자 하기 */}
      <div className="text-center">
        <p className="text-sm mb-3" style={{ color: COLORS.textSub }}>
          누가 준비할까?
        </p>
        <div className="flex gap-5">
          {profiles.map((profile, i) => (
            <motion.button
              key={profile.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
              whileTap={{ scale: 0.9, rotate: -2 }}
              onClick={() => handleSoloStart(profile)}
              className="sticker-card flex flex-col items-center gap-2 p-4"
              style={{ minWidth: "120px", transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <div className="char-idle">
                <Character
                  type={profile.characterType}
                  expression={isMorning ? "happy" : "sleeping"}
                  size={90}
                />
              </div>
              <div
                className="rounded-full"
                style={{ width: 50, height: 6, background: "rgba(108,92,231,0.1)", marginTop: -2 }}
              />
              <span className="text-base" style={{ color: COLORS.textDark }}>
                {profile.name}
              </span>
              <span
                className="jelly-btn px-4 py-1.5 text-sm"
                style={{
                  backgroundColor: isMorning ? COLORS.secondary : "#7C6CDB",
                  "--btn-shadow": isMorning ? "#E09030" : "#5041C0",
                } as React.CSSProperties}
              >
                시작!
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 같이 하기 */}
      <motion.button
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
        whileTap={{ scale: 0.9, rotate: 1 }}
        onClick={handleDualStart}
        className="flex items-center gap-3 px-5 py-3 rounded-full"
        style={{
          backgroundColor: isMorning ? COLORS.primary : "#7C6CDB",
          boxShadow: `0 4px 0 ${isMorning ? "#5041C0" : "#4A3BA0"}, 0 6px 16px rgba(108,92,231,0.25)`,
        }}
      >
        <div className="flex -space-x-3">
          {profiles.map((profile) => (
            <Character key={profile.id} type={profile.characterType} expression="excited" size={38} />
          ))}
        </div>
        <span className="text-base text-white">같이하기!</span>
      </motion.button>

      {/* 설정 버튼 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/settings")}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
        style={{ backgroundColor: "rgba(108,92,231,0.08)", color: COLORS.textSub }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        부모 설정
      </motion.button>
    </div>
  );
}
