# Plan: undo-complete (잘못 누른 완료 되돌리기)

## 1. 배경 / 문제

미션 진행 중 아이가 실수로 "✓ 완료!" 버튼을 누르면, 현재 태스크가 즉시 결과(`results`)에 기록되고 다음 태스크로 넘어간다. 마지막 태스크에서 누르면 `isCompleted=true`가 되어 완료 화면으로 전환된다. 되돌릴 방법이 없어 부모가 개입하거나 처음부터 다시 시작해야 했다.

## 2. 목표

직전 1회의 `completeTask` 호출을 되돌릴 수 있는 안전망을 제공한다.
- 가장 마지막 완료만 취소 가능 (단일 단계)
- 플레이어별 독립적으로 동작 (듀얼 모드에서 P1·P2가 각자의 undo 보유)
- UI는 **지속 버튼** 형태 — 직전 완료가 있을 때만 표시

## 3. 유저 스토리

```
As a 아침 루틴 사용자(아이/부모),
I want 방금 누른 "완료" 버튼을 한 번의 탭으로 취소할 수 있기를,
so that 실수로 다음 단계로 넘어갔거나 완료 화면으로 빠져도
       처음부터 다시 시작하지 않고 즉시 복구할 수 있다.
```

## 4. 수용 기준

### AC-1. 일반 태스크 완료 취소
```
Given 플레이어가 N번째 태스크를 완료해서 N+1로 넘어간 직후
When 사용자가 "↩ 방금 완료 취소" 버튼을 탭
Then  - currentTaskIndex가 N으로 복원
      - results 배열에서 마지막 항목 제거
      - 완료 직전의 elapsed / duration 오버라이드 복원
      - 완료 직전 타이머 실행 상태(active/paused)와 taskStartedAt 복원
      - undo 버튼은 사라짐 (스택 비워짐)
```

### AC-2. 마지막 태스크 완료(전체 완료) 취소
```
Given 플레이어의 마지막 태스크를 완료해 isCompleted=true가 된 직후
      (완료 화면이 보이는 상태)
When 사용자가 완료 화면에 노출된 "↩ 방금 완료 취소" 버튼을 탭
Then  - isCompleted=false로 복원
      - currentTaskIndex가 마지막 태스크로 복원
      - 일반 플레이 화면으로 돌아감
      - 보상(사과) 시퀀스는 화면 전환과 함께 사라짐
```

### AC-3. 1단계 한정
```
Given undo 스택에 직전 완료 1건이 저장된 상태
When 사용자가 다음 태스크에서 "완료"를 다시 탭
Then  - 새 스냅샷이 이전 스냅샷을 덮어씀 (스택 size = 1 유지)
      - undo는 항상 "방금 완료"만 가능
```

### AC-4. 무효화 조건
```
Given undo 스택에 직전 완료가 있는 상태
When 다음 동작 중 하나가 발생
     - restartPlayer / restartGame / resetGame 호출
     - goToTask로 다른 태스크로 이동
     - 새 세션 시작
Then undo 스택이 비워지고 버튼이 사라진다.
```

### AC-5. 플레이어 독립성 (듀얼 모드)
```
Given 듀얼 모드에서 P1만 완료를 누른 상태
When P1의 undo 버튼이 표시됨
Then  - P2 패널에는 undo 버튼이 보이지 않음
      - P1 undo는 P2 상태에 영향 없음
```

## 5. 동작 흐름

```
[현재]
  완료 탭 → completeTask() → 결과 push, currentTaskIndex++, (마지막이면) isCompleted=true

[변경 후]
  완료 탭 → completeTask()
              ├ 변경 전 PlayerState를 lastUndo에 스냅샷
              └ 기존 로직 그대로 실행

  취소 탭 → undoLastComplete(playerIndex)
              ├ lastUndo에서 스냅샷 꺼냄
              ├ players[playerIndex] = 스냅샷
              └ lastUndo 비움
```

## 6. 데이터 모델 변경

### `lib/types.ts` — `PlayerState`에 필드 추가
```ts
interface PlayerState {
  // ... 기존 필드
  lastUndo?: {
    // 완료 직전의 PlayerState 스냅샷 (lastUndo 자체는 제외)
    snapshot: Omit<PlayerState, "lastUndo">;
    // 어떤 태스크를 되돌리는지 표기용 (UI 라벨)
    taskLabel: string;
  };
}
```

> 왜 PlayerState 안에? — 듀얼 모드에서 플레이어별 독립 보장. 세션 sync 시에도 자연스럽게 함께 직렬화됨.

### `stores/useGameStore.ts` — 액션 추가
```ts
interface GameStore {
  // ... 기존
  undoLastComplete: (playerIndex: number) => void;
  hasUndoAvailable: (playerIndex: number) => boolean;
}
```

### `completeTask` 수정 포인트
- 변경 전 player를 snapshot으로 저장 (lastUndo 필드 제외)
- 새 player 객체에 `lastUndo: { snapshot, taskLabel }` 세팅

### 무효화 지점
- `restartPlayer`, `restartGame`, `resetGame`, `goToTask` → 해당 player의 `lastUndo`를 `undefined`로

## 7. UI 변경

### `components/dual/PlayerPanel.tsx`

**A. 진행 중 화면 (player.isCompleted === false)**

완료 버튼 위에 조건부 노출 — `player.lastUndo`가 있을 때만:
```
  [▶ 시작]                ← 80px
  18px gap
  [↩ 방금 완료 취소]       ← 56px, 작고 연한 색, lastUndo 있을 때만
  10px gap
  [✓ 완료!]                ← 80px
```

스타일: 작은 사이즈(56px), 연한 회색 배경 + 텍스트는 primary 보라색, Jua 폰트. 완료 버튼보다 시각적으로 덜 강조.

**B. 완료 화면 (player.isCompleted === true)**

캐릭터/사과 보상 카드 아래에 작은 텍스트 링크 형태로:
```
  [캐릭터 + "○○ 완료!"]
  [AppleTreeReward]
  [✓ 동그라미]
  ─────────────────
  ↩ 방금 완료 취소
```

## 8. 영향 범위

| 파일 | 변경 내용 |
|------|-----------|
| `lib/types.ts` | `PlayerState.lastUndo` 옵셔널 필드 추가 |
| `stores/useGameStore.ts` | `completeTask`에 스냅샷 저장, `undoLastComplete`/`hasUndoAvailable` 추가, restart/reset/goToTask에 무효화 |
| `components/dual/PlayerPanel.tsx` | 진행/완료 두 화면에 undo 버튼 렌더, `handleUndo` 핸들러, `soundManager.play("tap")` |
| `lib/sync.ts` (필요시) | 동기화 직렬화 대상 확인 — lastUndo가 동기화 페이로드에 자연스럽게 포함되는지 검증, 과대하면 제외 |

## 9. 엣지 케이스

| 케이스 | 동작 |
|--------|------|
| 완료 직후 페이지 새로고침 | undo 스택은 메모리 상태이므로 사라짐 (zustand persist 미사용 → OK) |
| 동기화 중 다른 기기에서 같은 플레이어 진행 | sync 정책에 따름. lastUndo는 로컬 hint성이므로 sync에서 빼는 것을 권장 |
| 완료 → 시간 조정/태스크 이동 → 취소 | AC-4에 의해 무효화. undo 버튼 보이지 않음 |
| 첫 태스크 완료 직후 취소 | results=[] / currentTaskIndex=0 으로 정상 복원 |

## 10. 비목표 (Non-goals)

- 다단계 undo / redo
- 완료 후 일정 시간 경과 시 자동 만료 (UI는 지속 버튼이므로 시간 만료 없음, AC-4의 행동 기반 무효화만)
- 통계(`useStatsStore`)에 기록된 데이터 되돌리기 — 통계는 세션 완전 종료 시점에만 기록되므로 영향 없음 (확인 필요)

## 11. 작업 분배

| 팀 | 작업 |
|----|------|
| **server** | `lib/types.ts` 타입 확장, `useGameStore` 액션 추가/수정, sync 정책 결정 |
| **frontend** | `PlayerPanel.tsx`에 undo 버튼 렌더 + 핸들러, 완료 화면 변형 |
| **design** | undo 버튼 스타일 톤(작고 연하게) 확정, 완료 화면 내 배치 |
| **qa** | AC-1~5 + 엣지 케이스 수동 검증, 듀얼 모드 독립성 확인 |

## 12. 의존 관계

```
[server: 타입 + 스토어]  →  [frontend: UI 통합]  →  [qa: 검증]
              ↑
       [design: 톤 확정] (병행 가능)
```
