# Plan: timer-controls-bugfix (타이머 제어 버그 수정)

## 1. 버그 개요

`timer-controls` 기능 구현 후 발견된 3건의 버그를 수정한다.

## 2. 버그 목록

### B1. 타이머가 시작 버튼 없이 자동 실행됨
- **현상**: 태스크 진입 시 `isTimerRunning: false`로 설정되지만, 타이머가 계속 카운트다운됨
- **원인**: `tick()`이 `store.now`를 매초 갱신 → `getRemainingSeconds()`가 `isTimerRunning` 무시하고 `now - taskStartedAt`으로 계산
- **수정**: `tick()`에서 `isTimerRunning === false`인 플레이어의 `taskStartedAt`를 delta만큼 전진시켜 elapsed 고정

### B2. 정지 버튼을 눌러도 타이머가 멈추지 않음
- **현상**: `pauseTimer()` 호출 후에도 카운트다운이 계속됨
- **원인**: B1과 동일 — `tick()`이 global `now`를 계속 갱신하므로 elapsed가 계속 증가
- **수정**: B1 수정으로 함께 해결

### B3. 하단 ProgressSteps 클릭 시 타이머가 표시되지 않음
- **현상**: 다른 항목 클릭 시 빈 화면 또는 정적 텍스트만 표시
- **수정**: 미리보기 모드에서도 해당 태스크의 설정 시간 기준 CountdownTimer를 표시

## 3. 영향 범위

| 파일 | 변경 내용 |
|------|-----------|
| `stores/useGameStore.ts` | `tick()` 수정 — 정지된 플레이어의 taskStartedAt 보정 |
| `components/dual/PlayerPanel.tsx` | 미리보기 모드에서 CountdownTimer 표시 |

## 4. 수정 방안

### tick() 수정
```
현재: set({ now: Date.now() })
변경:
  const currentTime = Date.now();
  const delta = currentTime - prevNow;
  paused players: taskStartedAt += delta (elapsed 고정)
  set({ now: currentTime, session with updated players })
```

### PlayerPanel 미리보기 수정
```
현재: 미리보기 시 정적 텍스트만 표시
변경: CountdownTimer(totalSeconds=viewingTask.duration, remainingSeconds=duration, isPaused=true) 표시
```
