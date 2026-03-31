# Plan: family-sync (가족 코드 기반 기기간 동기화)

## 1. 기능 개요

현재 deviceId 기반의 단방향 백업을 **가족 코드(Family Code)** 기반 양방향 실시간 동기화로 변경한다.
같은 가족 코드를 입력한 모든 기기가 동일한 설정/통계 데이터를 공유한다.

## 2. 요구사항

### R1. 가족 코드 생성
- 설정 페이지에서 "가족 코드 만들기" 버튼 → 랜덤 코드 자동 생성
- 형식: `형용사-동물-숫자4자리` (예: `happy-bear-1234`, `brave-cat-5678`)
- 한글 코드: `행복한-곰돌이-1234` 형태도 고려

### R2. 가족 코드 입력 (다른 기기에서)
- 설정 페이지에서 "가족 코드 입력" → 기존 가족에 합류
- 입력 시 Firebase에서 해당 코드 존재 여부 확인
- 존재하면 → 원격 데이터를 로컬에 동기화
- 존재하지 않으면 → "코드를 찾을 수 없습니다" 안내

### R3. 실시간 양방향 동기화
- 가족 코드 연결 후 설정/통계 변경 시 Firebase에 즉시 반영
- Firebase `onValue` 구독으로 다른 기기의 변경 사항 실시간 수신
- 충돌 방지: 마지막 쓰기 우선 (Last Write Wins)

### R4. 연결 해제
- "가족 코드 연결 해제" 버튼 → 로컬 데이터는 유지, 동기화만 중단
- deviceId 기반 독립 모드로 복귀

## 3. 영향 범위

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `lib/firebase.ts` | `getDeviceId()` → `getFamilyCode()` 변경, 가족 코드 관리 함수 추가 |
| `lib/sync.ts` | 양방향 동기화 로직 추가 |
| `stores/useSettingsStore.ts` | Firebase 구독 시 원격 데이터 반영 로직 |
| `stores/useStatsStore.ts` | Firebase 구독 시 원격 통계 반영 로직 |
| `app/settings/page.tsx` | 가족 코드 UI (생성/입력/해제) |

### 변경하지 않는 파일
- 게임 로직 (useGameStore) — 동기화 대상 아님
- 타이머 컴포넌트 — 변경 없음

## 4. 데이터 구조

### Firebase 경로 변경
```
현재: mrt/{deviceId}/settings, mrt/{deviceId}/stats
변경: mrt/families/{familyCode}/settings, mrt/families/{familyCode}/stats
```

### 로컬 저장
```
localStorage:
  mrt-family-code: "happy-bear-1234" | null
  mrt-firebase-config: { apiKey, databaseURL, projectId }
```

## 5. UI 변경

### 설정 페이지 - 데이터 동기화 섹션
```
┌─────────────────────────────┐
│  데이터 동기화               │
│                              │
│  [Firebase 미설정 시]        │
│  Firebase 설정이 필요합니다  │
│  [Firebase 설정하기]         │
│                              │
│  [Firebase 설정 완료 시]     │
│  가족 코드: happy-bear-1234  │
│  상태: 연결됨 ●              │
│                              │
│  [코드 복사]  [연결 해제]    │
│                              │
│  --- 또는 ---                │
│                              │
│  [새 가족 코드 만들기]       │
│  [기존 코드로 합류하기]      │
└─────────────────────────────┘
```

## 6. 동기화 흐름

### 가족 코드 생성 (첫 기기)
```
1. "새 가족 코드 만들기" 클릭
2. 랜덤 코드 생성
3. Firebase에 families/{code}/settings = 현재 로컬 설정 저장
4. localStorage에 코드 저장
5. onValue 구독 시작
```

### 가족 코드 합류 (다른 기기)
```
1. 코드 입력 → Firebase에서 families/{code} 존재 확인
2. 존재하면 → 원격 settings/stats를 로컬에 덮어쓰기
3. localStorage에 코드 저장
4. onValue 구독 시작
```

### 실시간 동기화
```
로컬 변경 발생
  → Zustand persist → localStorage 저장
  → syncSettings() → Firebase families/{code}/settings 업데이트

원격 변경 수신 (onValue)
  → 로컬과 다르면 → Zustand store 업데이트 → 화면 반영
  → 무한 루프 방지: 자신이 쓴 변경은 무시 (타임스탬프 비교)
```

## 7. 구현 순서

1. `lib/firebase.ts` — 가족 코드 관리 함수 (생성, 저장, 조회, 삭제)
2. `lib/sync.ts` — 양방향 동기화 로직 (subscribe + push)
3. `stores/useSettingsStore.ts` — 원격 데이터 수신 시 store 업데이트
4. `stores/useStatsStore.ts` — 원격 통계 수신 시 store 업데이트
5. `app/settings/page.tsx` — 가족 코드 UI (생성/입력/해제/상태 표시)

## 8. 수용 기준

- [ ] 가족 코드 생성 시 Firebase에 데이터 저장됨
- [ ] 다른 기기에서 같은 코드 입력 시 데이터 동기화됨
- [ ] 한 기기에서 설정 변경 시 다른 기기에 실시간 반영
- [ ] 연결 해제 시 로컬 데이터 유지, 동기화 중단
- [ ] Firebase 미설정 시 graceful fallback (localStorage만 사용)
- [ ] 빌드 에러 없음
