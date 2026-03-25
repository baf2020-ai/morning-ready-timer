import type { TaskItem, PlayerProfile, CharacterType } from "./types";

export const DEFAULT_TASKS: TaskItem[] = [
  { id: "blanket",  label: "이불 정리",   icon: "blanket",  durationSeconds: 180,  order: 0 },
  { id: "meal",     label: "아침 먹기",   icon: "meal",     durationSeconds: 1200, order: 1 },
  { id: "brush",    label: "세수 & 양치", icon: "brush",    durationSeconds: 600,  order: 2 },
  { id: "clothes",  label: "옷 갈아입기", icon: "clothes",  durationSeconds: 600,  order: 3 },
  { id: "backpack", label: "가방 챙기기", icon: "backpack", durationSeconds: 300,  order: 4 },
  { id: "shoes",    label: "신발 신기",   icon: "shoes",    durationSeconds: 120,  order: 5 },
];

// 잠자리 준비 기본 태스크
export const DEFAULT_BEDTIME_TASKS: TaskItem[] = [
  { id: "bath",     label: "씻기",       icon: "brush",    durationSeconds: 900,  order: 0 },
  { id: "pajama",   label: "잠옷 입기",   icon: "clothes",  durationSeconds: 300,  order: 1 },
  { id: "teeth",    label: "양치하기",    icon: "brush",    durationSeconds: 180,  order: 2 },
  { id: "bag-prep", label: "가방 준비",   icon: "backpack", durationSeconds: 300,  order: 3 },
  { id: "bed",      label: "이불 속으로", icon: "blanket",  durationSeconds: 180,  order: 4 },
];

// 루틴별 테마
export const ROUTINE_THEME = {
  morning: {
    title: "등원 준비",
    emoji: "☀️",
    subtitle: "오늘도 씩씩하게 출발~",
    completePraise: "등원 준비 완료!",
    headerTitle: "아침 준비!",
    bgClass: "cloud-bg",
  },
  bedtime: {
    title: "잠자리 준비",
    emoji: "🌙",
    subtitle: "오늘 하루도 수고했어~",
    completePraise: "잠자리 준비 완료!",
    headerTitle: "자기 전 준비!",
    bgClass: "night-bg",
  },
} as const;

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

// 새 팔레트: "놀이터" 테마
export const COLORS = {
  // 메인
  primary: "#6C5CE7",      // 블루베리 보라
  secondary: "#FFAD42",    // 선샤인 옐로
  accent: "#E84393",       // 딸기 핑크
  mint: "#00B894",         // 민트 (성공/완료)

  // 타이머
  timerGreen: "#00B894",
  timerYellow: "#FDCB6E",
  timerRed: "#E84393",

  // 배경
  bgLight: "#FFF8F0",
  bgPurple: "#F8F0FF",
  bgCard: "#FFFFFF",

  // 캐릭터
  bunny: "#FF8FA3",
  bear: "#8CC152",
  cat: "#54A0FF",
  penguin: "#A29BFE",

  // 캐릭터 스트로크
  bunnyStroke: "#E84393",
  bearStroke: "#6AB04C",
  catStroke: "#2E86DE",
  penguinStroke: "#6C5CE7",

  // 텍스트
  textDark: "#2B2040",
  textSub: "#8B7FA8",

  // 그림자
  cardShadow: "rgba(108, 92, 231, 0.08)",
} as const;

// 칭찬 문구 (완료 화면용)
export const PRAISE_MESSAGES = {
  morning: ["대단해! 🌟", "멋져! 최고야!", "와~ 잘했어!", "짱이야! 👏", "오늘도 멋진 하루!"],
  bedtime: ["잘 준비했어! 🌙", "굿나잇! 😴", "좋은 꿈 꿔~! ✨", "오늘 하루 수고했어!", "내일도 화이팅! 💫"],
};
