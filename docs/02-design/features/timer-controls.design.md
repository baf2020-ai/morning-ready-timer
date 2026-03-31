# Design: timer-controls (타이머 제어 기능 강화)

> Plan 참조: `docs/01-plan/features/timer-controls.plan.md`

## 1. 타입 변경

### `lib/types.ts` - PlayerState 확장

```typescript
export interface PlayerState {
  profileId: string;
  currentTaskIndex: number;
  results: TaskResult[];
  isCompleted: boolean;
  startedAt: string;
  taskStartedAt: number;
  // 신규 필드
  isTimerRunning: boolean;      // false = 대기/일시정지, true = 카운트다운 중
  viewingTaskIndex?: number;    // 스텝 클릭으로 보고 있는 항목 인덱스 (undefined = currentTaskIndex)
  adjustedDuration?: number;    // +/-1분으로 조정된 현재 태스크 시간 (undefined = 원래 시간 사용)
}
```

**설계 판단**:
- `adjustedDuration`을 PlayerState에 둔 이유: 세션 한정 변경이므로 TaskItem 원본을 수정하지 않음
- `viewingTaskIndex`가 undefined이면 `currentTaskIndex`를 보여줌 (기존 동작과 동일)

## 2. Store 변경

### `stores/useGameStore.ts` - 4개 액션 추가

```typescript
interface GameStore {
  // 기존 유지...

  // 신규 액션
  startTimer: (playerIndex: number) => void;
  pauseTimer: (playerIndex: number) => void;
  goToTask: (playerIndex: number, taskIndex: number) => void;
  adjustTime: (playerIndex: number, deltaSeconds: number) => void;
}
```

#### startTimer(playerIndex)
```
1. player.isTimerRunning = true
2. viewingTaskIndex가 있으면 → undefined로 초기화 (현재 태스크로 복귀)
3. taskStartedAt = Date.now() - 이미 경과된 시간
   (일시정지 후 재개 시 경과 시간 보존)
```

**경과 시간 보존 로직**:
```
처음 시작: taskStartedAt = Date.now()
일시정지 → 재개: taskStartedAt = Date.now() - elapsedBeforePause
```
→ `elapsedBeforePause`는 정지 시점에 계산하여 별도 저장하지 않고,
  정지 시 `taskStartedAt`를 변경하지 않으므로 `now - taskStartedAt`으로 복원 가능.
  단, tick()이 멈추므로 `store.now`가 정지 시점에 고정됨.
  **재개 시**: `taskStartedAt = Date.now() - (pausedNow - taskStartedAt)` 계산.

#### pauseTimer(playerIndex)
```
1. player.isTimerRunning = false
2. taskStartedAt 변경하지 않음 (store.now 기준으로 elapsed 계산 가능)
```

#### goToTask(playerIndex, taskIndex)
```
1. taskIndex가 완료된 항목 (< currentTaskIndex):
   → viewingTaskIndex = taskIndex (읽기 전용 미리보기)
   → isTimerRunning 변경 없음
2. taskIndex === currentTaskIndex:
   → viewingTaskIndex = undefined (원래 위치로 복귀)
3. taskIndex > currentTaskIndex (미래 항목):
   → viewingTaskIndex = taskIndex (미리보기)
   → isTimerRunning 변경 없음
```

#### adjustTime(playerIndex, deltaSeconds)
```
1. 현재 태스크의 duration 가져오기 (adjustedDuration ?? task.durationSeconds)
2. newDuration = currentDuration + deltaSeconds
3. 최소 60초 (1분) 이하로 내려가지 않음
4. player.adjustedDuration = newDuration
```

### tick() 수정
```
기존: session.isPaused이면 전체 정지
추가: 각 player.isTimerRunning === false이면 해당 플레이어만 시간 진행 안 함
```

**구현**: tick()은 `store.now = Date.now()`만 하므로,
getRemainingSeconds()에서 `isTimerRunning` 체크하여 정지 시 고정된 remaining 반환.

### getRemainingSeconds() 수정
```
기존: task.durationSeconds - elapsed
변경:
  duration = player.adjustedDuration ?? task.durationSeconds
  if (!player.isTimerRunning) → duration - frozenElapsed (정지 시점 기준)
  else → duration - liveElapsed
```

### startGame() 수정
```
players 초기화 시:
  isTimerRunning: false  // 대기 상태로 시작
  viewingTaskIndex: undefined
  adjustedDuration: undefined
```

### completeTask() 수정
```
다음 태스크 이동 시:
  isTimerRunning: false  // 대기 상태로 전환
  viewingTaskIndex: undefined
  adjustedDuration: undefined  // 시간 조정 초기화
```

## 3. 컴포넌트 변경

### CountdownTimer - 대기 상태 시각화

**Props 추가**:
```typescript
interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
  enableAlerts?: boolean;
  isPaused?: boolean;  // 신규: 대기/일시정지 상태
}
```

**대기 상태 UI**:
- 파이 색상: `opacity: 0.25` (기존 0.4 → 흐리게)
- 파이 색상을 `#C8C0D8` (회색 보라)로 변경
- 중앙 시간 아래 "탭하여 시작" 텍스트 표시 (fontSize: 8)
- 눈금/숫자 라벨 opacity: 0.4

### PlayerPanel - 제어 버튼 추가

**타이머 아래 제어 영역** (타이머와 태스크 이름 사이):
```
[-1분]  [▶ 시작 / ⏸ 정지]  [+1분]
```

| 요소 | 스타일 | 동작 |
|------|--------|------|
| -1분 버튼 | 원형, 40x40, `#F0EBFF`, 텍스트 `-1` | adjustTime(playerIndex, -60) |
| 시작 버튼 | 라운드, 민트색, `▶ 시작` 텍스트 | startTimer(playerIndex) |
| 정지 버튼 | 라운드, 보라색, `⏸ 정지` 텍스트 | pauseTimer(playerIndex) |
| +1분 버튼 | 원형, 40x40, `#F0EBFF`, 텍스트 `+1` | adjustTime(playerIndex, +60) |

**미리보기 모드** (viewingTaskIndex !== undefined):
- 타이머 영역에 해당 태스크의 설정 시간을 보여줌 (카운트다운 아님)
- 완료된 태스크: 결과 (별점, 소요 시간) 표시
- "돌아가기" 버튼 → goToTask(playerIndex, currentTaskIndex)
- 완료/시작/정지/시간조절 버튼 숨김

### ProgressSteps - 클릭 가능

**Props 추가**:
```typescript
interface ProgressStepsProps {
  tasks: TaskItem[];
  currentStep: number;
  compact?: boolean;
  onStepClick?: (index: number) => void;  // 신규
  viewingStep?: number;                    // 신규: 현재 보고 있는 스텝
}
```

**클릭 스타일**:
- 모든 스텝 아이콘에 `cursor: pointer` + `onClick` 핸들러
- `viewingStep`과 일치하는 스텝: 주황색 테두리 (`COLORS.secondary`) 강조
- 탭 시 살짝 스케일 애니메이션 (`whileTap={{ scale: 0.9 }}`)

## 4. 구현 순서 (의존성 기반)

```
Step 1: lib/types.ts
  └─ PlayerState에 isTimerRunning, viewingTaskIndex, adjustedDuration 추가

Step 2: stores/useGameStore.ts
  ├─ startGame() 초기값 수정
  ├─ startTimer(), pauseTimer(), goToTask(), adjustTime() 추가
  ├─ completeTask() 다음 태스크 전환 시 상태 초기화
  └─ getRemainingSeconds() adjustedDuration + isTimerRunning 반영

Step 3: components/timer/CountdownTimer.tsx
  └─ isPaused prop 추가, 대기 상태 시각화

Step 4: components/timer/ProgressSteps.tsx
  └─ onStepClick, viewingStep props 추가, 클릭 스타일

Step 5: components/dual/PlayerPanel.tsx
  ├─ 시작/정지 + 시간조절 버튼 추가
  ├─ 미리보기 모드 UI (viewingTaskIndex 처리)
  └─ ProgressSteps에 onStepClick 연결
```

## 5. 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| 전체 일시정지 + 개별 시작 상태 | 전체 일시정지가 우선. 전체 재개 시 각 플레이어의 isTimerRunning 유지 |
| 미리보기 중 완료 버튼 | 완료 버튼은 미리보기 모드에서 숨김 |
| 시간을 0으로 줄이면? | 최소 60초 (1분) 유지 |
| 오버타임 중 시간 추가 | 남은 시간이 양수로 복귀 가능 |
| 듀얼 모드에서 한 명만 시작 | 정상. 각 플레이어 독립 |
