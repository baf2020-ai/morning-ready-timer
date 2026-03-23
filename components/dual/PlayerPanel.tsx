"use client";

import { useCallback } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import TaskCard from "@/components/timer/TaskCard";
import ProgressRoad from "@/components/timer/ProgressRoad";
import StarRating from "@/components/gamification/StarRating";

interface PlayerPanelProps {
  playerIndex: number;
  compact?: boolean;
}

export default function PlayerPanel({ playerIndex, compact }: PlayerPanelProps) {
  const session = useGameStore((s) => s.session);
  const completeTask = useGameStore((s) => s.completeTask);
  const getRemainingSeconds = useGameStore((s) => s.getRemainingSeconds);
  const profiles = useSettingsStore((s) => s.settings.profiles);

  const handleComplete = useCallback(() => {
    completeTask(playerIndex);
  }, [completeTask, playerIndex]);

  if (!session) return null;

  const player = session.players[playerIndex];
  const profile = profiles.find((p) => p.id === player.profileId) ?? profiles[0];
  const currentTask = session.tasks[player.currentTaskIndex];
  const nextTask = session.tasks[player.currentTaskIndex + 1] ?? null;
  const remaining = getRemainingSeconds(playerIndex);

  if (player.isCompleted) {
    const totalStars = player.results.reduce((sum, r) => sum + r.stars, 0);
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <p className="text-3xl">🎉</p>
        <p className="text-lg font-bold" style={{ color: "#2D3436" }}>{profile.name} 완료!</p>
        <p className="text-2xl">⭐ × {totalStars}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between h-full p-3 gap-2">
      {/* 이름 */}
      <p className={`font-bold ${compact ? "text-sm" : "text-base"}`} style={{ color: "#2D3436" }}>
        {profile.name}
      </p>

      {/* 로드맵 */}
      <ProgressRoad
        totalSteps={session.tasks.length}
        currentStep={player.currentTaskIndex}
        characterType={profile.characterType}
        compact={compact}
      />

      {/* 진행률 */}
      <div className="w-full max-w-[280px] h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(player.currentTaskIndex / session.tasks.length) * 100}%`,
            backgroundColor: "#4ECDC4",
          }}
        />
      </div>
      <p className="text-xs" style={{ color: "#636E72" }}>
        {player.currentTaskIndex}/{session.tasks.length}
      </p>

      {/* 현재 항목 */}
      <TaskCard
        task={currentTask}
        remainingSeconds={remaining}
        onComplete={handleComplete}
        nextTask={nextTask}
      />

      {/* 별 모음 */}
      <StarRating results={player.results} totalTasks={session.tasks.length} compact={compact} />
    </div>
  );
}
