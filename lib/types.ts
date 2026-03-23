/** SVG 아이콘 타입 */
export type TaskIconType =
  | "blanket"
  | "meal"
  | "brush"
  | "clothes"
  | "backpack"
  | "shoes";

/** 준비 항목 정의 */
export interface TaskItem {
  id: string;
  label: string;
  icon: TaskIconType;
  durationSeconds: number;
  order: number;
}

/** 별 등급 */
export type StarGrade = 1 | 2 | 3;

/** 항목 완료 결과 */
export interface TaskResult {
  taskId: string;
  stars: StarGrade;
  elapsedSeconds: number;
  completedAt: string;
}

/** 플레이어 상태 */
export interface PlayerState {
  profileId: string;
  currentTaskIndex: number;
  results: TaskResult[];
  isCompleted: boolean;
  startedAt: string;
  taskStartedAt: number; // Date.now() for timer calculation
}

/** 게임 세션 */
export interface GameSession {
  mode: "solo" | "dual";
  players: PlayerState[];
  tasks: TaskItem[];
  isPaused: boolean;
  isMuted: boolean;
}

/** 캐릭터 타입 */
export type CharacterType = "bunny" | "bear" | "cat" | "penguin";

/** 아이 프로필 */
export interface PlayerProfile {
  id: string;
  name: string;
  characterType: CharacterType;
}

/** 일간 기록 */
export interface DailyRecord {
  date: string;
  totalStars: number;
  totalSeconds: number;
  isAllClear: boolean;
  sessions: {
    profileId: string;
    stars: number;
    seconds: number;
    isAllClear: boolean;
  }[];
}

/** 설정 */
export interface AppSettings {
  tasks: TaskItem[];
  profiles: PlayerProfile[];
  targetTime: string | null;
  pinCode: string | null;
}
