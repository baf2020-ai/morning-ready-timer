import type { TaskItem, PlayerProfile, CharacterType } from "./types";

export const DEFAULT_CHARACTER_TYPE: CharacterType = "byeol";

export const CHARACTER_TYPES = ["byeol", "mori", "pari", "sosol", "dali"] as const satisfies readonly CharacterType[];

const LEGACY_CHARACTER_TYPE_MAP: Record<string, CharacterType> = {
  bunny: "byeol",
  bear: "mori",
  cat: "pari",
  penguin: "sosol",
};

export function normalizeCharacterType(value: unknown): CharacterType {
  if (typeof value !== "string") return DEFAULT_CHARACTER_TYPE;
  if ((CHARACTER_TYPES as readonly string[]).includes(value)) return value as CharacterType;
  return LEGACY_CHARACTER_TYPE_MAP[value] ?? DEFAULT_CHARACTER_TYPE;
}

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

// 캐릭터 목록
export const CHARACTERS: { type: CharacterType; label: string; emoji: string }[] = [
  { type: "byeol", label: "토토",    emoji: "⭐" },  // 토끼
  { type: "mori",  label: "도도",    emoji: "🌿" },  // 곰
  { type: "pari",  label: "초롱이",  emoji: "💧" },  // 개구리
  { type: "sosol", label: "뾰족이",  emoji: "🌰" },  // 고슴도치
  { type: "dali",  label: "귀요미",  emoji: "🌙" },  // 여우
];

export const DEFAULT_PROFILES: PlayerProfile[] = [
  { id: "player1", name: "플레이어 1", characterType: "byeol", tasks: DEFAULT_TASKS, bedtimeTasks: DEFAULT_BEDTIME_TASKS },
  { id: "player2", name: "플레이어 2", characterType: "mori",  tasks: DEFAULT_TASKS, bedtimeTasks: DEFAULT_BEDTIME_TASKS },
];

// 새 팔레트: "별숲 마을" 테마
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

  // 캐릭터 색상
  byeol: "#FF8FA3",        // 토토(토끼) — 핑크
  mori: "#C8A882",         // 도도(곰)   — 브라운
  pari: "#A3D977",         // 초롱이(개구리) — 밝은 초록
  sosol: "#C8B89A",        // 뾰족이(고슴도치) — 베이지
  dali: "#E07850",         // 귀요미(여우) — 주황

  // 별씨 프렌즈 스트로크
  byeolStroke: "#E84393",
  moriStroke:  "#A07850",
  pariStroke:  "#5D9E3C",
  sosolStroke: "#A07850",
  daliStroke:  "#C05830",

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
