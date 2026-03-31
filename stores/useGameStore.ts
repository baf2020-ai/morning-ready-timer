"use client";

import { create } from "zustand";
import type { GameSession, PlayerState, TaskItem, PlayerProfile, StarGrade, TaskResult, RoutineType } from "@/lib/types";
import { STAR_THRESHOLDS } from "@/lib/constants";
import { soundManager } from "@/lib/sounds";

interface GameStore {
  session: GameSession | null;
  now: number;

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
  // 신규 액션
  startTimer: (playerIndex: number) => void;
  pauseTimer: (playerIndex: number) => void;
  goToTask: (playerIndex: number, taskIndex: number) => void;
  adjustTime: (playerIndex: number, deltaSeconds: number) => void;
  setDuration: (playerIndex: number, seconds: number) => void;
  getTaskDuration: (playerIndex: number) => number;
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
      isTimerRunning: false,        // 대기 상태로 시작
      viewingTaskIndex: undefined,
      adjustedDuration: undefined,
    }));

    set({
      session: {
        mode,
        routineType,
        players,
        tasks: playerTasks[0] ?? [],
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

  getTaskDuration: (playerIndex) => {
    const { session } = get();
    if (!session) return 0;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return 0;
    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return 0;
    return player.adjustedDuration ?? task.durationSeconds;
  },

  startTimer: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted || player.isTimerRunning) return;

    // 경과 시간 보존: 이전에 일시정지했던 elapsed를 유지
    const elapsed = now - player.taskStartedAt;
    const currentTime = Date.now();

    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        isTimerRunning: true,
        viewingTaskIndex: undefined,  // 미리보기 해제
        taskStartedAt: currentTime - elapsed,  // elapsed 보존
      };
    });
    set({ session: { ...session, players: newPlayers }, now: currentTime });
  },

  pauseTimer: (playerIndex) => {
    const { session } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted || !player.isTimerRunning) return;

    // now를 현재 시간으로 갱신하여 elapsed 고정
    const currentTime = Date.now();
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return { ...p, isTimerRunning: false };
    });
    set({ session: { ...session, players: newPlayers }, now: currentTime });
  },

  goToTask: (playerIndex, taskIndex) => {
    const { session } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;
    if (taskIndex === player.currentTaskIndex) return; // 같은 태스크면 무시

    const tasks = get().getPlayerTasks(playerIndex);
    if (taskIndex < 0 || taskIndex >= tasks.length) return;

    const currentTime = Date.now();
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        currentTaskIndex: taskIndex,
        isTimerRunning: false,
        taskStartedAt: currentTime,
        viewingTaskIndex: undefined,
        adjustedDuration: undefined,
        isCompleted: false,
      };
    });
    set({ session: { ...session, players: newPlayers }, now: currentTime });
  },

  adjustTime: (playerIndex, deltaSeconds) => {
    const { session } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return;

    const currentDuration = player.adjustedDuration ?? task.durationSeconds;
    const newDuration = Math.max(60, currentDuration + deltaSeconds); // 최소 1분

    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return { ...p, adjustedDuration: newDuration };
    });
    set({ session: { ...session, players: newPlayers } });
  },

  setDuration: (playerIndex, seconds) => {
    const { session } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const newDuration = Math.max(60, seconds); // 최소 1분
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return { ...p, adjustedDuration: newDuration };
    });
    set({ session: { ...session, players: newPlayers } });
  },

  completeTask: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;

    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return;

    const duration = player.adjustedDuration ?? task.durationSeconds;
    const elapsed = Math.floor((now - player.taskStartedAt) / 1000);
    const stars = get().getStarGrade(elapsed, duration);

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
        isTimerRunning: false,          // 다음 태스크는 대기 상태
        viewingTaskIndex: undefined,
        adjustedDuration: undefined,    // 시간 조정 초기화
      };
    });

    set({ session: { ...session, players: newPlayers } });
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
    const prevNow = get().now;
    const currentTime = Date.now();
    const delta = currentTime - prevNow;

    // 정지된 플레이어의 taskStartedAt를 delta만큼 전진 → elapsed 고정
    let playersChanged = false;
    const newPlayers = session.players.map((p) => {
      if (p.isCompleted || p.isTimerRunning) return p;
      playersChanged = true;
      return { ...p, taskStartedAt: p.taskStartedAt + delta };
    });

    set({
      now: currentTime,
      ...(playersChanged ? { session: { ...session, players: newPlayers } } : {}),
    });
  },

  getRemainingSeconds: (playerIndex) => {
    const { session, now } = get();
    if (!session) return 0;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return 0;
    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return 0;
    const duration = player.adjustedDuration ?? task.durationSeconds;
    const elapsed = Math.floor((now - player.taskStartedAt) / 1000);
    return duration - elapsed;
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
