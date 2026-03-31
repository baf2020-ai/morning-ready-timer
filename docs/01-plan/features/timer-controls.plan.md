# Plan: timer-controls (타이머 제어 기능 강화)

## 1. 기능 개요

현재 타이머는 태스크 진입 시 자동 시작되고, 전체 일시정지만 가능하며, 진행 상태 스텝은 보기 전용이다.
이번 기능에서 **개별 타이머 시작/일시정지**, **실시간 시간 변경**, **스텝 클릭 이동**을 추가하여 유연한 타이머 제어를 지원한다.

## 2. 요구사항

### R1. 타이머 시작/일시정지
- 각 플레이어의 타이머에 **시작 / 일시정지** 토글 버튼 추가
- 태스크 진입 시 타이머가 **자동 시작되지 않고 대기 상태**로 시작
- "시작" 누르면 카운트다운 시작, "일시정지" 누르면 해당 플레이어만 일시정지
- 듀얼 모드에서 각 플레이어가 **독립적으로** 시작/정지 가능
- 헤더의 전체 일시정지는 기존대로 유지 (모든 플레이어 동시 정지)

### R2. 타이머 시간 변경
- 타이머 실행 중 남은 시간을 **+1분 / -1분** 버튼으로 조절 가능
- 최소 시간: 0분 (0 이하로 내려가지 않음)
- 변경된 시간은 해당 세션에서만 적용 (설정의 원래 시간은 변경하지 않음)

### R3. 하단 진행 상태 클릭으로 항목 이동
- ProgressSteps의 각 스텝 아이콘을 **클릭 가능**하게 변경
- 클릭 시 해당 항목으로 이동하여 타이머 표시
- 이동 후 타이머는 **자동 시작하지 않음** (대기 상태)
- 이미 완료된 항목도 탭하면 **결과 확인용**으로 볼 수 있음 (읽기 전용, 타이머 미동작)
- 완료되지 않은 앞선 항목으로도 이동 가능 (건너뛰기 아님, 미리보기 개념)

## 3. 영향 범위

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `lib/types.ts` | `PlayerState`에 `isTimerRunning` 필드 추가 |
| `stores/useGameStore.ts` | `startTimer`, `pauseTimer`, `goToTask`, `adjustTime` 액션 추가 |
| `components/dual/PlayerPanel.tsx` | 시작/정지 버튼, +/-1분 버튼, 대기 상태 UI |
| `components/timer/ProgressSteps.tsx` | 클릭 핸들러, 현재 보기 항목 표시 |
| `components/timer/CountdownTimer.tsx` | 대기(paused) 상태 시각적 표현 |

### 변경하지 않는 파일
- `stores/useSettingsStore.ts` - 설정은 변경하지 않음
- `app/play/PlayContent.tsx` - 헤더 전체 일시정지는 기존 유지

## 4. 상태 모델 변경

```
PlayerState 확장:
  isTimerRunning: boolean  // false = 대기, true = 카운트다운 중
  viewingTaskIndex?: number // 스텝 클릭으로 보고 있는 항목 (없으면 currentTaskIndex)
```

### 타이머 상태 흐름
```
[태스크 진입] → 대기(isTimerRunning=false)
     ↓ (시작 버튼)
[카운트다운 중] → isTimerRunning=true
     ↓ (일시정지 버튼)
[일시정지] → isTimerRunning=false, elapsed 보존
     ↓ (시작 버튼)
[카운트다운 재개]
     ↓ (완료 버튼)
[다음 태스크] → 대기(isTimerRunning=false)
```

## 5. UI 변경 사항

### PlayerPanel 레이아웃 변경
```
┌─────────────────────────┐
│     유미  [2/6]         │  ← 이름 + 진행
│                         │
│    ┌───────────┐        │
│    │  타이머   │        │  ← CountdownTimer
│    │  05:30    │        │
│    └───────────┘        │
│    [-1분] ▶시작 [+1분]  │  ← 제어 버튼 (시작/정지 + 시간조절)
│                         │
│    🍽 아침 먹기          │  ← 현재 태스크
│                         │
│    [완료!]              │  ← 완료 버튼
│                         │
│  예상 완료 08:15        │
│  ○ ○ ● ○ ○ ○          │  ← 클릭 가능한 ProgressSteps
└─────────────────────────┘
```

### 대기 상태 시각화
- CountdownTimer: 파이 영역이 회색/불투명하게 표시
- 중앙 시간 텍스트 아래 "탭하여 시작" 표시
- 시작 버튼: ▶ 아이콘, 민트색
- 정지 버튼: ⏸ 아이콘, 보라색

## 6. 구현 순서

1. `PlayerState` 타입에 `isTimerRunning`, `viewingTaskIndex` 필드 추가
2. `useGameStore`에 `startTimer`, `pauseTimer`, `goToTask`, `adjustTime` 추가
3. `tick()` 수정: `isTimerRunning === false`인 플레이어는 시간 진행 안 함
4. `CountdownTimer`에 대기 상태 시각적 표현 추가
5. `PlayerPanel`에 시작/정지 + 시간조절 버튼 UI 추가
6. `ProgressSteps`에 `onStepClick` 콜백 추가 + 클릭 스타일
7. 듀얼 모드 테스트 (각 플레이어 독립 제어 확인)

## 7. 수용 기준

- [ ] 태스크 진입 시 타이머가 자동 시작되지 않고 대기 상태
- [ ] 시작 버튼 누르면 카운트다운 시작
- [ ] 일시정지 버튼 누르면 해당 플레이어만 정지
- [ ] +1분/-1분 버튼으로 남은 시간 조절 가능
- [ ] ProgressSteps 스텝 클릭 시 해당 항목으로 이동
- [ ] 이동 후 타이머 자동 시작하지 않음
- [ ] 듀얼 모드에서 각 플레이어 독립 제어 가능
- [ ] 빌드 에러 없음
