"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, TaskItem, PlayerProfile, RoutineType } from "@/lib/types";
import { DEFAULT_TASKS, DEFAULT_BEDTIME_TASKS, DEFAULT_PROFILES } from "@/lib/constants";

interface SettingsStore {
  settings: AppSettings;
  updateTasks: (tasks: TaskItem[], routine?: RoutineType) => void;
  addTask: (task: Omit<TaskItem, "order">, routine?: RoutineType) => void;
  removeTask: (taskId: string, routine?: RoutineType) => void;
  reorderTasks: (fromIndex: number, toIndex: number, routine?: RoutineType) => void;
  updateTaskDuration: (taskId: string, durationSeconds: number, routine?: RoutineType) => void;
  getTasksForRoutine: (routine: RoutineType) => TaskItem[];
  updateProfile: (profileId: string, updates: Partial<PlayerProfile>) => void;
  setTargetTime: (time: string | null) => void;
  setPinCode: (pin: string | null) => void;
  verifyPin: (pin: string) => boolean;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  tasks: DEFAULT_TASKS,
  bedtimeTasks: DEFAULT_BEDTIME_TASKS,
  profiles: DEFAULT_PROFILES,
  targetTime: null,
  pinCode: null,
};

function getTaskKey(routine: RoutineType): "tasks" | "bedtimeTasks" {
  return routine === "bedtime" ? "bedtimeTasks" : "tasks";
}

function safeGetTasks(settings: AppSettings, routine: RoutineType): TaskItem[] {
  const key = getTaskKey(routine);
  return settings[key] ?? (routine === "bedtime" ? DEFAULT_BEDTIME_TASKS : DEFAULT_TASKS);
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      getTasksForRoutine: (routine) => {
        const key = getTaskKey(routine);
        const tasks = get().settings[key];
        if (!tasks || tasks.length === 0) {
          return routine === "bedtime" ? DEFAULT_BEDTIME_TASKS : DEFAULT_TASKS;
        }
        return tasks;
      },

      updateTasks: (tasks, routine = "morning") =>
        set((state) => ({ settings: { ...state.settings, [getTaskKey(routine)]: tasks } })),

      addTask: (task, routine = "morning") =>
        set((state) => {
          const key = getTaskKey(routine);
          const tasks = [...safeGetTasks(state.settings, routine)];
          const newTask: TaskItem = { ...task, order: tasks.length };
          return { settings: { ...state.settings, [key]: [...tasks, newTask] } };
        }),

      removeTask: (taskId, routine = "morning") =>
        set((state) => {
          const key = getTaskKey(routine);
          const tasks = safeGetTasks(state.settings, routine)
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, order: i }));
          return { settings: { ...state.settings, [key]: tasks } };
        }),

      reorderTasks: (fromIndex, toIndex, routine = "morning") =>
        set((state) => {
          const key = getTaskKey(routine);
          const tasks = [...safeGetTasks(state.settings, routine)];
          const [moved] = tasks.splice(fromIndex, 1);
          tasks.splice(toIndex, 0, moved);
          const reordered = tasks.map((t, i) => ({ ...t, order: i }));
          return { settings: { ...state.settings, [key]: reordered } };
        }),

      updateTaskDuration: (taskId, durationSeconds, routine = "morning") =>
        set((state) => {
          const key = getTaskKey(routine);
          const tasks = safeGetTasks(state.settings, routine).map((t) =>
            t.id === taskId ? { ...t, durationSeconds } : t
          );
          return { settings: { ...state.settings, [key]: tasks } };
        }),

      updateProfile: (profileId, updates) =>
        set((state) => {
          const profiles = state.settings.profiles.map((p) =>
            p.id === profileId ? { ...p, ...updates } : p
          );
          return { settings: { ...state.settings, profiles } };
        }),

      setTargetTime: (time) =>
        set((state) => ({ settings: { ...state.settings, targetTime: time } })),

      setPinCode: (pin) =>
        set((state) => ({ settings: { ...state.settings, pinCode: pin } })),

      verifyPin: (pin) => get().settings.pinCode === pin,

      resetToDefaults: () => set({ settings: defaultSettings }),
    }),
    { name: "mrt-settings" }
  )
);
