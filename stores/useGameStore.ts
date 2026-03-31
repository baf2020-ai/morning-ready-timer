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
  startTimer: (playerIndex: number) => void;
  pauseTimer: (playerIndex: number) => void;
  goToTask: (playerIndex: number, taskIndex: number) => void;
  adjustTime: (playerIndex: number, deltaSeconds: number) => void;
  setDuration: (playerIndex: number, seconds: number) => void;
  getTaskDuration: (playerIndex: number) => number;
}

/**
 * 플레이어의 특정 태스크 경과 시간(ms)을 라이브로 계산하는 헬퍼.
 * - 해당 태스크가 activeRunningTaskIndex이고 isTimerRunning이면 → 라이브 계산
 * - 아니면 → elapsedOverrides에서 가져옴 (없으면 0)
 */
function getTaskElapsedMs(player: PlayerState, taskIndex: number, tasks: TaskItem[], now: number): number {
  if (player.isTimerRunning && player.activeRunningTaskIndex === taskIndex) {
    return now - player.taskStartedAt;
  }
  const task = tasks[taskIndex];
  if (!task) return 0;
  return player.elapsedOverrides?.[task.id] ?? 0;
}

/** 태스크의 duration(초)을 가져오는 헬퍼 */
function getTaskDurationSec(player: PlayerState, taskIndex: number, tasks: TaskItem[]): number {
  const task = tasks[taskIndex];
  if (!task) return 0;
  // 현재 보고 있는 태스크의 adjustedDuration (activeRunning인 경우)
  if (player.activeRunningTaskIndex === taskIndex && player.adjustedDuration !== undefined) {
    return player.adjustedDuration;
  }
  return player.durationOverrides?.[task.id] ?? task.durationSeconds;
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
      isTimerRunning: false,
      activeRunningTaskIndex: undefined,
      viewingTaskIndex: undefined,
      adjustedDuration: undefined,
      durationOverrides: {},
      elapsedOverrides: {},
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
    return getTaskDurationSec(player, player.currentTaskIndex, tasks);
  },

  startTimer: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const displayedIndex = player.currentTaskIndex;
    const displayedTask = tasks[displayedIndex];
    if (!displayedTask) return;

    // 이미 이 태스크가 실행 중이면 무시
    if (player.isTimerRunning && player.activeRunningTaskIndex === displayedIndex) return;

    const currentTime = Date.now();
    const elapsedOv = { ...(player.elapsedOverrides ?? {}) };
    const durationOv = { ...(player.durationOverrides ?? {}) };

    // 기존에 다른 태스크가 실행 중이면 → 정지 & 경과 저장
    let newAdjustedDuration = player.adjustedDuration;
    if (player.isTimerRunning && player.activeRunningTaskIndex !== undefined) {
      const oldTask = tasks[player.activeRunningTaskIndex];
      if (oldTask) {
        elapsedOv[oldTask.id] = now - player.taskStartedAt;
        // 기존 태스크의 adjustedDuration도 overrides에 저장
        if (player.adjustedDuration !== undefined) {
          durationOv[oldTask.id] = player.adjustedDuration;
        }
      }
    }

    // 표시 중인 태스크의 경과 시간 복원
    const restoredElapsed = elapsedOv[displayedTask.id] ?? 0;
    newAdjustedDuration = durationOv[displayedTask.id] ?? undefined;

    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        isTimerRunning: true,
        activeRunningTaskIndex: displayedIndex,
        taskStartedAt: currentTime - restoredElapsed,
        viewingTaskIndex: undefined,
        adjustedDuration: newAdjustedDuration !== undefined ? newAdjustedDuration : undefined,
        durationOverrides: durationOv,
        elapsedOverrides: elapsedOv,
      };
    });
    set({ session: { ...session, players: newPlayers }, now: currentTime });
  },

  pauseTimer: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted || !player.isTimerRunning) return;

    const currentTime = Date.now();
    const tasks = get().getPlayerTasks(playerIndex);

    // 실행 중인 태스크의 경과 저장
    const elapsedOv = { ...(player.elapsedOverrides ?? {}) };
    if (player.activeRunningTaskIndex !== undefined) {
      const activeTask = tasks[player.activeRunningTaskIndex];
      if (activeTask) {
        elapsedOv[activeTask.id] = now - player.taskStartedAt;
      }
    }

    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        isTimerRunning: false,
        elapsedOverrides: elapsedOv,
      };
    });
    set({ session: { ...session, players: newPlayers }, now: currentTime });
  },

  goToTask: (playerIndex, taskIndex) => {
    const { session, now } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;
    if (taskIndex === player.currentTaskIndex) return;

    const tasks = get().getPlayerTasks(playerIndex);
    if (taskIndex < 0 || taskIndex >= tasks.length) return;

    const currentTime = Date.now();

    // 현재 보고 있는 태스크의 duration override 저장 (activeRunning이 아닌 경우에도)
    const durationOv = { ...(player.durationOverrides ?? {}) };
    const currentTask = tasks[player.currentTaskIndex];
    if (currentTask && player.currentTaskIndex !== player.activeRunningTaskIndex && player.adjustedDuration !== undefined) {
      durationOv[currentTask.id] = player.adjustedDuration;
    }

    // 타이머가 실행 중이면: 실행 중인 태스크의 경과 시간 갱신 (라이브)
    const elapsedOv = { ...(player.elapsedOverrides ?? {}) };
    if (player.isTimerRunning && player.activeRunningTaskIndex !== undefined) {
      const activeTask = tasks[player.activeRunningTaskIndex];
      if (activeTask) {
        elapsedOv[activeTask.id] = now - player.taskStartedAt;
      }
    }

    // 이동할 태스크의 duration 복원
    const targetTask = tasks[taskIndex];
    const restoredDuration = targetTask ? durationOv[targetTask.id] : undefined;

    // 타이머 실행 상태: activeRunningTaskIndex와 isTimerRunning은 유지
    // taskStartedAt도 유지 (activeRunning 태스크를 위해)
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        currentTaskIndex: taskIndex,
        viewingTaskIndex: undefined,
        adjustedDuration: restoredDuration,
        durationOverrides: durationOv,
        elapsedOverrides: elapsedOv,
        isCompleted: false,
        // isTimerRunning, activeRunningTaskIndex, taskStartedAt → 그대로 유지
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

    const currentDuration = getTaskDurationSec(player, player.currentTaskIndex, tasks);
    const newDuration = Math.max(60, currentDuration + deltaSeconds);

    const durationOv = { ...(player.durationOverrides ?? {}), [task.id]: newDuration };
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      // activeRunning 태스크의 duration을 변경하는 경우 adjustedDuration도 갱신
      const isActiveTask = player.activeRunningTaskIndex === player.currentTaskIndex;
      return {
        ...p,
        adjustedDuration: isActiveTask ? newDuration : p.adjustedDuration,
        durationOverrides: durationOv,
      };
    });
    set({ session: { ...session, players: newPlayers } });
  },

  setDuration: (playerIndex, seconds) => {
    const { session } = get();
    if (!session) return;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const task = tasks[player.currentTaskIndex];
    if (!task) return;

    const newDuration = Math.max(60, seconds);
    const durationOv = { ...(player.durationOverrides ?? {}), [task.id]: newDuration };
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      const isActiveTask = player.activeRunningTaskIndex === player.currentTaskIndex;
      return {
        ...p,
        adjustedDuration: isActiveTask ? newDuration : p.adjustedDuration,
        durationOverrides: durationOv,
      };
    });
    set({ session: { ...session, players: newPlayers } });
  },

  completeTask: (playerIndex) => {
    const { session, now } = get();
    if (!session) return;

    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return;

    const tasks = get().getPlayerTasks(playerIndex);
    const displayedIndex = player.currentTaskIndex;
    const task = tasks[displayedIndex];
    if (!task) return;

    // 표시 중인 태스크의 경과 시간 및 duration 계산
    const elapsedMs = getTaskElapsedMs(player, displayedIndex, tasks, now);
    const elapsed = Math.floor(elapsedMs / 1000);
    const duration = getTaskDurationSec(player, displayedIndex, tasks);
    const stars = get().getStarGrade(elapsed, duration);

    const result: TaskResult = {
      taskId: task.id,
      stars,
      elapsedSeconds: elapsed,
      completedAt: new Date().toISOString(),
    };

    const newResults = [...player.results, result];
    const nextIndex = displayedIndex + 1;
    const isCompleted = nextIndex >= tasks.length;

    soundManager.play(isCompleted ? "allClear" : "complete");

    // duration override 저장
    const durationOv = { ...(player.durationOverrides ?? {}) };
    if (duration !== task.durationSeconds) {
      durationOv[task.id] = duration;
    }

    // elapsed override에서 완료된 태스크 제거
    const elapsedOv = { ...(player.elapsedOverrides ?? {}) };
    delete elapsedOv[task.id];

    // 완료한 태스크가 activeRunning이었으면 타이머 정지
    const wasActiveRunning = player.activeRunningTaskIndex === displayedIndex;

    // 다음 태스크의 duration 복원
    const nextTask = tasks[nextIndex];
    const restoredDuration = nextTask ? durationOv[nextTask.id] : undefined;

    const currentTime = Date.now();
    const newPlayers = session.players.map((p, i) => {
      if (i !== playerIndex) return p;
      return {
        ...p,
        results: newResults,
        currentTaskIndex: isCompleted ? displayedIndex : nextIndex,
        isCompleted,
        isTimerRunning: wasActiveRunning ? false : p.isTimerRunning,
        activeRunningTaskIndex: wasActiveRunning ? undefined : p.activeRunningTaskIndex,
        taskStartedAt: wasActiveRunning ? currentTime : p.taskStartedAt,
        viewingTaskIndex: undefined,
        adjustedDuration: restoredDuration,
        durationOverrides: durationOv,
        elapsedOverrides: elapsedOv,
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

    // 타이머가 정지된 플레이어의 taskStartedAt를 delta만큼 전진 → elapsed 고정
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
    const displayedIndex = player.currentTaskIndex;
    const duration = getTaskDurationSec(player, displayedIndex, tasks);
    const elapsedMs = getTaskElapsedMs(player, displayedIndex, tasks, now);
    const elapsed = Math.floor(elapsedMs / 1000);
    return duration - elapsed;
  },

  getElapsedSeconds: (playerIndex) => {
    const { session, now } = get();
    if (!session) return 0;
    const player = session.players[playerIndex];
    if (!player || player.isCompleted) return 0;
    const tasks = get().getPlayerTasks(playerIndex);
    const elapsedMs = getTaskElapsedMs(player, player.currentTaskIndex, tasks, now);
    return Math.floor(elapsedMs / 1000);
  },

  getStarGrade: (elapsed, limit) => {
    const ratio = elapsed / limit;
    if (ratio <= STAR_THRESHOLDS.THREE_STAR) return 3;
    if (ratio <= STAR_THRESHOLDS.TWO_STAR) return 2;
    return 1;
  },
}));
