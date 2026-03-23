import type { TaskItem, PlayerProfile, CharacterType } from "./types";

export const DEFAULT_TASKS: TaskItem[] = [
  { id: "blanket",  label: "이불 정리",   icon: "blanket",  durationSeconds: 180,  order: 0 },
  { id: "meal",     label: "아침 먹기",   icon: "meal",     durationSeconds: 1200, order: 1 },
  { id: "brush",    label: "세수 & 양치", icon: "brush",    durationSeconds: 600,  order: 2 },
  { id: "clothes",  label: "옷 갈아입기", icon: "clothes",  durationSeconds: 600,  order: 3 },
  { id: "backpack", label: "가방 챙기기", icon: "backpack", durationSeconds: 300,  order: 4 },
  { id: "shoes",    label: "신발 신기",   icon: "shoes",    durationSeconds: 120,  order: 5 },
];

export const STAR_THRESHOLDS = {
  THREE_STAR: 1.0,
  TWO_STAR: 1.5,
} as const;

export const CHARACTERS: { type: CharacterType; label: string }[] = [
  { type: "bunny",   label: "토끼" },
  { type: "bear",    label: "곰돌이" },
  { type: "cat",     label: "고양이" },
  { type: "penguin", label: "펭귄" },
];

export const DEFAULT_PROFILES: PlayerProfile[] = [
  { id: "player1", name: "플레이어 1", characterType: "bunny" },
  { id: "player2", name: "플레이어 2", characterType: "bear" },
];

export const COLORS = {
  primary: "#FF6B6B",
  secondary: "#4ECDC4",
  accent: "#FFE66D",
  timerGreen: "#51CF66",
  timerYellow: "#FFD43B",
  timerRed: "#FF6B6B",
  bgLight: "#FFF9E6",
  bgCard: "#FFFFFF",
  bunny: "#FFB3BA",
  bear: "#BAFFC9",
  cat: "#BAE1FF",
  penguin: "#E8BAFF",
  textDark: "#2D3436",
} as const;
