"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Character from "@/components/svg/characters/Character";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useGameStore } from "@/stores/useGameStore";
import { soundManager } from "@/lib/sounds";

export default function HomePage() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const startGame = useGameStore((s) => s.startGame);
  const profiles = settings.profiles;

  const handleStart = async (mode: "solo" | "dual") => {
    await soundManager.init();
    soundManager.play("tap");

    if (mode === "solo") {
      startGame("solo", settings.tasks, [profiles[0]]);
    } else {
      startGame("dual", settings.tasks, profiles);
    }
    router.push(`/play?mode=${mode}`);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-8 px-6"
      style={{ background: "linear-gradient(180deg, #FFF9E6 0%, #FFE8CC 100%)" }}
    >
      {/* 로고 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-black" style={{ color: "#FF6B6B" }}>
          ☀️ 준비 히어로!
        </h1>
        <p className="text-sm mt-2" style={{ color: "#636E72" }}>
          즐거운 등원 준비 시작!
        </p>
      </motion.div>

      {/* 모드 선택 */}
      <div className="flex gap-6">
        {/* 1인 모드 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleStart("solo")}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl shadow-lg"
          style={{ backgroundColor: "#FFFFFF", minWidth: "140px" }}
        >
          <Character type={profiles[0].characterType} expression="happy" size={80} />
          <span className="text-base font-bold" style={{ color: "#2D3436" }}>
            {profiles[0].name}
          </span>
          <span
            className="px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "#4ECDC4" }}
          >
            혼자 하기
          </span>
        </motion.button>

        {/* 2인 모드 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleStart("dual")}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl shadow-lg"
          style={{ backgroundColor: "#FFFFFF", minWidth: "140px" }}
        >
          <div className="flex -space-x-4">
            <Character type={profiles[0].characterType} expression="happy" size={60} />
            <Character type={profiles[1].characterType} expression="happy" size={60} />
          </div>
          <span className="text-base font-bold" style={{ color: "#2D3436" }}>
            같이 하기
          </span>
          <span
            className="px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "#FF6B6B" }}
          >
            둘이서!
          </span>
        </motion.button>
      </div>

      {/* 설정 버튼 */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/settings")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
        style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#636E72" }}
      >
        ⚙️ 부모 설정
      </motion.button>
    </div>
  );
}
