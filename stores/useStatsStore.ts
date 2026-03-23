"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyRecord } from "@/lib/types";

interface StatsStore {
  records: DailyRecord[];
  streak: number;
  addRecord: (record: DailyRecord) => void;
  getTodayRecord: () => DailyRecord | null;
  getStreak: () => number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(records: DailyRecord[]): number {
  const sorted = [...records]
    .filter((r) => r.isAllClear)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (sorted[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      records: [],
      streak: 0,

      addRecord: (record) =>
        set((state) => {
          const existing = state.records.findIndex((r) => r.date === record.date);
          let records: DailyRecord[];
          if (existing >= 0) {
            records = [...state.records];
            // Merge sessions
            records[existing] = {
              ...records[existing],
              totalStars: records[existing].totalStars + record.totalStars,
              totalSeconds: records[existing].totalSeconds + record.totalSeconds,
              isAllClear: records[existing].isAllClear || record.isAllClear,
              sessions: [...records[existing].sessions, ...record.sessions],
            };
          } else {
            records = [...state.records, record];
          }
          return { records, streak: calculateStreak(records) };
        }),

      getTodayRecord: () => {
        const today = getToday();
        return get().records.find((r) => r.date === today) ?? null;
      },

      getStreak: () => calculateStreak(get().records),
    }),
    { name: "mrt-stats" }
  )
);
