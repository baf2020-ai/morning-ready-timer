"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, TaskItem, PlayerProfile } from "@/lib/types";
import { DEFAULT_TASKS, DEFAULT_PROFILES } from "@/lib/constants";

interface SettingsStore {
  settings: AppSettings;
  updateTasks: (tasks: TaskItem[]) => void;
  addTask: (task: Omit<TaskItem, "order">) => void;
  removeTask: (taskId: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  updateTaskDuration: (taskId: string, durationSeconds: number) => void;
  updateProfile: (profileId: string, updates: Partial<PlayerProfile>) => void;
  setTargetTime: (time: string | null) => void;
  setPinCode: (pin: string | null) => void;
  verifyPin: (pin: string) => boolean;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  tasks: DEFAULT_TASKS,
  profiles: DEFAULT_PROFILES,
  targetTime: null,
  pinCode: null,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateTasks: (tasks) =>
        set((state) => ({ settings: { ...state.settings, tasks } })),

      addTask: (task) =>
        set((state) => {
          const tasks = [...state.settings.tasks];
          const newTask: TaskItem = { ...task, order: tasks.length };
          return { settings: { ...state.settings, tasks: [...tasks, newTask] } };
        }),

      removeTask: (taskId) =>
        set((state) => {
          const tasks = state.settings.tasks
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, order: i }));
          return { settings: { ...state.settings, tasks } };
        }),

      reorderTasks: (fromIndex, toIndex) =>
        set((state) => {
          const tasks = [...state.settings.tasks];
          const [moved] = tasks.splice(fromIndex, 1);
          tasks.splice(toIndex, 0, moved);
          const reordered = tasks.map((t, i) => ({ ...t, order: i }));
          return { settings: { ...state.settings, tasks: reordered } };
        }),

      updateTaskDuration: (taskId, durationSeconds) =>
        set((state) => {
          const tasks = state.settings.tasks.map((t) =>
            t.id === taskId ? { ...t, durationSeconds } : t
          );
          return { settings: { ...state.settings, tasks } };
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
