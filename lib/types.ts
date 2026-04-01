/** 루틴 타입 */
export type RoutineType = "morning" | "bedtime";

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
  taskStartedAt: number;          // Date.now() for timer calculation
  isTimerRunning: boolean;        // false = 대기/일시정지, true = 카운트다운 중
  activeRunningTaskIndex?: number; // 실제 타이머가 돌고 있는 태스크 인덱스
  viewingTaskIndex?: number;      // 스텝 클릭 미리보기 (undefined = currentTaskIndex)
  adjustedDuration?: number;      // +/-1분 세션 한정 조정 (undefined = 원래 시간)
  durationOverrides?: Record<string, number>;  // 태스크별 시간 변경 (taskId → seconds)
  elapsedOverrides?: Record<string, number>;   // 태스크별 경과 시간 보존 (taskId → elapsed ms)
}

/** 게임 세션 */
export interface GameSession {
  mode: "solo" | "dual";
  routineType: RoutineType;
  players: PlayerState[];
  tasks: TaskItem[];           // legacy fallback
  playerTasks: TaskItem[][];   // 아이별 태스크 목록
  isPaused: boolean;
  isMuted: boolean;
}

/** 캐릭터 타입 */
export type CharacterType = "bunny" | "bear" | "cat" | "penguin";

/** 아이 프로필 (아이별 루틴 항목 포함) */
export interface PlayerProfile {
  id: string;
  name: string;
  characterType: CharacterType;
  bgColor?: string;
  tasks: TaskItem[];
  bedtimeTasks: TaskItem[];
}

/** 일간 기록 */
export interface DailyRecord {
  date: string;
  routineType?: RoutineType;
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
  tasks: TaskItem[];           // legacy (마이그레이션용)
  bedtimeTasks: TaskItem[];    // legacy (마이그레이션용)
  profiles: PlayerProfile[];
  targetTime: string | null;
  pinCode: string | null;
}
