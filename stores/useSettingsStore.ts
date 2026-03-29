"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, TaskItem, PlayerProfile, RoutineType } from "@/lib/types";
import { DEFAULT_TASKS, DEFAULT_BEDTIME_TASKS, DEFAULT_PROFILES } from "@/lib/constants";
import { syncSettings } from "@/lib/sync";

interface SettingsStore {
  settings: AppSettings;
  // 아이별 태스크 관리
  getTasksForProfile: (profileId: string, routine: RoutineType) => TaskItem[];
  addTaskForProfile: (profileId: string, task: Omit<TaskItem, "order">, routine?: RoutineType) => void;
  removeTaskForProfile: (profileId: string, taskId: string, routine?: RoutineType) => void;
  reorderTasksForProfile: (profileId: string, fromIndex: number, toIndex: number, routine?: RoutineType) => void;
  updateTaskDurationForProfile: (profileId: string, taskId: string, durationSeconds: number, routine?: RoutineType) => void;
  updateTaskForProfile: (profileId: string, taskId: string, updates: Partial<Pick<TaskItem, "label" | "icon">>, routine?: RoutineType) => void;
  // Legacy: 호환용
  getTasksForRoutine: (routine: RoutineType) => TaskItem[];
  updateProfile: (profileId: string, updates: Partial<Omit<PlayerProfile, "tasks" | "bedtimeTasks">>) => void;
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

function getProfileTaskKey(routine: RoutineType): "tasks" | "bedtimeTasks" {
  return routine === "bedtime" ? "bedtimeTasks" : "tasks";
}

function getProfileTasks(profile: PlayerProfile, routine: RoutineType): TaskItem[] {
  const key = getProfileTaskKey(routine);
  const tasks = profile[key];
  if (!tasks || tasks.length === 0) {
    return routine === "bedtime" ? DEFAULT_BEDTIME_TASKS : DEFAULT_TASKS;
  }
  return tasks;
}

/** 기존 공유 tasks를 프로필별로 마이그레이션 */
function migrateSettings(settings: AppSettings): AppSettings {
  const profiles = settings.profiles.map((p) => {
    const needsMigration = !p.tasks || p.tasks.length === 0;
    if (needsMigration) {
      return {
        ...p,
        tasks: settings.tasks?.length ? settings.tasks : DEFAULT_TASKS,
        bedtimeTasks: settings.bedtimeTasks?.length ? settings.bedtimeTasks : DEFAULT_BEDTIME_TASKS,
      };
    }
    return p;
  });
  return { ...settings, profiles };
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      getTasksForProfile: (profileId, routine) => {
        const profile = get().settings.profiles.find((p) => p.id === profileId);
        if (!profile) return routine === "bedtime" ? DEFAULT_BEDTIME_TASKS : DEFAULT_TASKS;
        return getProfileTasks(profile, routine);
      },

      // Legacy: 첫 번째 프로필의 태스크 반환
      getTasksForRoutine: (routine) => {
        const profile = get().settings.profiles[0];
        if (!profile) return routine === "bedtime" ? DEFAULT_BEDTIME_TASKS : DEFAULT_TASKS;
        return getProfileTasks(profile, routine);
      },

      addTaskForProfile: (profileId, task, routine = "morning") =>
        set((state) => {
          const key = getProfileTaskKey(routine);
          const profiles = state.settings.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tasks = [...getProfileTasks(p, routine)];
            const newTask: TaskItem = { ...task, order: tasks.length };
            return { ...p, [key]: [...tasks, newTask] };
          });
          return { settings: { ...state.settings, profiles } };
        }),

      removeTaskForProfile: (profileId, taskId, routine = "morning") =>
        set((state) => {
          const key = getProfileTaskKey(routine);
          const profiles = state.settings.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tasks = getProfileTasks(p, routine)
              .filter((t) => t.id !== taskId)
              .map((t, i) => ({ ...t, order: i }));
            return { ...p, [key]: tasks };
          });
          return { settings: { ...state.settings, profiles } };
        }),

      reorderTasksForProfile: (profileId, fromIndex, toIndex, routine = "morning") =>
        set((state) => {
          const key = getProfileTaskKey(routine);
          const profiles = state.settings.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tasks = [...getProfileTasks(p, routine)];
            const [moved] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, moved);
            const reordered = tasks.map((t, i) => ({ ...t, order: i }));
            return { ...p, [key]: reordered };
          });
          return { settings: { ...state.settings, profiles } };
        }),

      updateTaskDurationForProfile: (profileId, taskId, durationSeconds, routine = "morning") =>
        set((state) => {
          const key = getProfileTaskKey(routine);
          const profiles = state.settings.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tasks = getProfileTasks(p, routine).map((t) =>
              t.id === taskId ? { ...t, durationSeconds } : t
            );
            return { ...p, [key]: tasks };
          });
          return { settings: { ...state.settings, profiles } };
        }),

      updateTaskForProfile: (profileId, taskId, updates, routine = "morning") =>
        set((state) => {
          const key = getProfileTaskKey(routine);
          const profiles = state.settings.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tasks = getProfileTasks(p, routine).map((t) =>
              t.id === taskId ? { ...t, ...updates } : t
            );
            return { ...p, [key]: tasks };
          });
          return { settings: { ...state.settings, profiles } };
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
    {
      name: "mrt-settings",
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            // 마이그레이션: 기존 공유 tasks → 프로필별
            const migrated = migrateSettings(state.settings);
            if (migrated !== state.settings) {
              useSettingsStore.setState({ settings: migrated });
            }
            // Subscribe to changes and sync to remote
            useSettingsStore.subscribe((s) => {
              syncSettings(s.settings);
            });
          }
        };
      },
    }
  )
);
