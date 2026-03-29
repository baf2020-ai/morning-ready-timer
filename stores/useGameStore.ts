"use client";

import { create } from "zustand";
import type { GameSession, PlayerState, TaskItem, PlayerProfile, StarGrade, TaskResult, RoutineType } from "@/lib/types";
import { STAR_THRESHOLDS } from "@/lib/constants";
import { soundManager } from "@/lib/sounds";

interface GameStore {
  session: GameSession | null;
  now: number; // Date.now(), updated every second

  startGame: (mode: "solo" | "dual", playerTasks: TaskItem[][], profiles: PlayerProfile[], routineType?: RoutineType) => void;
  completeTask: (playerIndex: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  toggleMute: () => void;
  resetGame: () => void;
  tick: () => void;
  getRemainingSeconds: (playerIndex: number) => number;
  getElapsedSeconds: (playerIndex: number) => number;
  getStarGrade: (elapsed: number, limit: number) => StarGrade;
  getPlayerTasks: (playerIndex: number) => TaskItem[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  now: Date.now(),

  startGame: (mode, playerTasks, profiles, routineType = "morning") => {
    const timestamp = Date.now();
    const players: PlayerState[] = profiles.map((p) => ({
      profileId: p.id,
      currentTaskIndex: 0,
      results: [],
      isCompleted: false,
      startedAt: new Date(timestamp).toISOString(),
      taskStartedAt: timestamp,
    }));

    set({
      session: {
        mode,
        routineType,
        players,
        tasks: playerTasks[0] ?? [],       // legacy fallback
        playerTasks,
        isPaused: false,
        isMuted: soundManager.muted,
      },
      now: timestamp,
    });
  },

  getPlayerTasks: (playerIndex) => {
    const { session } = get();
    if (!session) return [];
    return session.playerTasks[playerIndex] ?? session.tasks;
  },

  completeTask: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;

    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return;
    const elapsed = Math.floor((now - player.taskStartedAt) / 1000);
    const stars = get().getStarGrade(elapsed, task.durationSeconds);

    const result: TaskResult = {
      taskId: task.id,
      stars,
      elapsedSeconds: elapsed,
      completedAt: new Date().toISOString(),
    };

    const newResults = [...player.results, result];
    const nextIndex = player.currentTaskIndex + 1;
    const isCompleted = nextIndex >= tasks.length;

    soundManager.play(isCompleted ? "allClear" : "complete");

    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        results: newResults,
        currentTaskIndex: isCompleted ? p.currentTaskIndex : nextIndex,
        isCompleted,
        taskStartedAt: Date.now(),
      };
    });

    set({
      session: { ...session, players: newPlayers },
    });
  },

  pauseGame: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, isPaused: true } });
  },

  resumeGame: () => {
    const { session } = get();
    if (!session) return;
    const now = Date.now();
    const pauseAdjustedPlayers = session.players.map((p) => {
      if (p.isCompleted) return p;
      const elapsed = get().now - p.taskStartedAt;
      return { ...p, taskStartedAt: now - elapsed };
    });
    set({ session: { ...session, isPaused: false, players: pauseAdjustedPlayers }, now });
  },

  toggleMute: () => {
    const isMuted = soundManager.toggleMute();
    const { session } = get();
    if (session) {
      set({ session: { ...session, isMuted } });
    }
  },

  resetGame: () => {
    set({ session: null });
  },

  tick: () => {
    const { session } = get();
    if (!session || session.isPaused) return;
    set({ now: Date.now() });
  },

  getRemainingSeconds: (playerIndex) => {
    const { session, now } = get();
    if (!session) return 0;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return 0;
    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return 0;
    const elapsed = Math.floor((now - player.taskStartedAt) / 1000);
    return task.durationSeconds - elapsed;
  },

  getElapsedSeconds: (playerIndex) => {
    const { session, now } = get();
    if (!session) return 0;
    const player = session.players[playerIndex];
    if (!player) return 0;
    if (player.isCompleted) return 0;
    return Math.floor((now - player.taskStartedAt) / 1000);
  },

  getStarGrade: (elapsed, limit) => {
    const ratio = elapsed / limit;
    if (ratio <= STAR_THRESHOLDS.THREE_STAR) return 3;
    if (ratio <= STAR_THRESHOLDS.TWO_STAR) return 2;
    return 1;
  },
}));
