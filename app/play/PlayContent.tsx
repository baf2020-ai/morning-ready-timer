"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore } from "@/stores/useGameStore";
import { useStatsStore } from "@/stores/useStatsStore";
import PlayerPanel from "@/components/dual/PlayerPanel";
import DualLayout from "@/components/dual/DualLayout";

export default function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as "solo" | "dual" | null;
  const session = useGameStore((s) => s.session);
  const tick = useGameStore((s) => s.tick);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const addRecord = useStatsStore((s) => s.addRecord);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      tick();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tick]);

  useEffect(() => {
    if (!session || navigatedRef.current) return;
    const allDone = session.players.every((p) => p.isCompleted);
    if (allDone) {
      navigatedRef.current = true;
      const today = new Date().toISOString().split("T")[0];
      const sessions = session.players.map((p) => {
        const stars = p.results.reduce((sum, r) => sum + r.stars, 0);
        const seconds = p.results.reduce((sum, r) => sum + r.elapsedSeconds, 0);
        return { profileId: p.profileId, stars, seconds, isAllClear: true };
      });
      const totalStars = sessions.reduce((sum, s) => sum + s.stars, 0);
      const totalSeconds = sessions.reduce((sum, s) => sum + s.seconds, 0);

      addRecord({
        date: today,
        totalStars,
        totalSeconds,
        isAllClear: true,
        sessions,
      });

      setTimeout(() => router.push(`/complete?mode=${mode}`), 500);
    }
  }, [session, router, mode, addRecord]);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  if (!session) return null;

  const handlePauseToggle = () => {
    if (session.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const handleHome = () => {
    resetGame();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FFF9E6" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200" style={{ backgroundColor: "#FFFFFF" }}>
        <button onClick={handleHome} className="text-sm px-3 py-1 rounded-full" style={{ color: "#636E72" }}>
          ← 홈
        </button>
        <h1 className="text-base font-bold" style={{ color: "#FF6B6B" }}>
          ☀️ 아침 준비!
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handlePauseToggle}
            className="text-lg w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            {session.isPaused ? "▶️" : "⏸️"}
          </button>
          <button
            onClick={toggleMute}
            className="text-lg w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            {session.isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Pause overlay */}
      {session.isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>⏸️ 일시정지</p>
            <button
              onClick={handlePauseToggle}
              className="px-8 py-3 rounded-full text-white font-bold text-lg"
              style={{ backgroundColor: "#4ECDC4" }}
            >
              계속하기 ▶️
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === "dual" ? (
          <DualLayout />
        ) : (
          <div className="flex items-center justify-center h-full">
            <PlayerPanel playerIndex={0} />
          </div>
        )}
      </div>
    </div>
  );
}
