"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/useGameStore";
import { useStatsStore } from "@/stores/useStatsStore";
import Confetti from "@/components/gamification/Confetti";

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

  const handleHome = () => {
    resetGame();
    router.push("/");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <button onClick={handleHome} className="text-lg" style={{ color: "#636E72" }}>
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

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-6 px-6"
      style={{ background: "linear-gradient(180deg, #FFF9E6 0%, #FFE8CC 100%)" }}
    >
      <Confetti />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <p className="text-5xl mb-2">🎉</p>
        <h1 className="text-3xl font-black" style={{ color: "#FF6B6B" }}>
          등원 준비 완료!
        </h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 shadow-lg text-center w-full max-w-xs"
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm" style={{ color: "#636E72" }}>오늘의 별</p>
            <p className="text-2xl font-bold">
              {"⭐".repeat(Math.min(totalStars, 18))}
            </p>
            <p className="text-lg font-bold" style={{ color: "#FF6B6B" }}>
              × {totalStars}
            </p>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm" style={{ color: "#636E72" }}>총 시간</p>
            <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
              {formatTotalTime(totalSeconds)}
            </p>
          </div>

          {streak > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm" style={{ color: "#636E72" }}>연속 기록</p>
              <p className="text-xl font-bold" style={{ color: "#FF6B6B" }}>
                🔥 {streak}일
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleHome}
        className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg"
        style={{ backgroundColor: "#4ECDC4" }}
      >
        🏠 처음으로
      </motion.button>
    </div>
  );
}
