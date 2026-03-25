"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore } from "@/stores/useGameStore";
import { useStatsStore } from "@/stores/useStatsStore";
import PlayerPanel from "@/components/dual/PlayerPanel";
import DualLayout from "@/components/dual/DualLayout";
import { COLORS, ROUTINE_THEME } from "@/lib/constants";

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
        routineType: session.routineType,
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
    <div className="relative flex flex-col h-full paper-bg" style={{ backgroundColor: COLORS.bgLight }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 safe-top"
        style={{ backgroundColor: "white", borderBottom: `2px solid #F0EBFF` }}
      >
        <button
          onClick={handleHome}
          className="text-sm px-3 py-1.5 rounded-full"
          style={{ color: COLORS.textSub, backgroundColor: "rgba(108,92,231,0.06)" }}
        >
          ← 홈
        </button>
        <h1 className="text-base" style={{ color: COLORS.primary }}>
          {ROUTINE_THEME[session.routineType ?? "morning"].headerTitle}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handlePauseToggle}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(108,92,231,0.06)", color: COLORS.primary }}
          >
            {session.isPaused ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1" /><rect x="15" y="3" width="4" height="18" rx="1" /></svg>
            )}
          </button>
          <button
            onClick={toggleMute}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(108,92,231,0.06)", color: COLORS.primary }}
          >
            {session.isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Pause overlay */}
      {session.isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}>
          <div
            className="sticker-card p-8 flex flex-col items-center gap-4"
            style={{ transform: "rotate(0deg)" }}
          >
            <p className="text-2xl" style={{ color: COLORS.textDark }}>일시정지</p>
            <button
              onClick={handlePauseToggle}
              className="jelly-btn px-8 py-3 text-lg text-white"
              style={{
                backgroundColor: COLORS.mint,
                "--btn-shadow": "#009B7D",
              } as React.CSSProperties}
            >
              계속하기
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
