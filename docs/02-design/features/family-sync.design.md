# Design: family-sync (가족 코드 기반 기기간 동기화)

> Plan 참조: `docs/01-plan/features/family-sync.plan.md`

## 1. Firebase 경로 변경

### 현재
```
mrt/{deviceId}/settings
mrt/{deviceId}/stats
```

### 변경 후
```
mrt/families/{familyCode}/settings
mrt/families/{familyCode}/stats
mrt/families/{familyCode}/meta   ← 가족 코드 메타 (생성일, 기기 수)
```

**설계 판단**: `deviceId` 개념을 완전히 제거하고 `familyCode`로 대체. 가족 코드가 없으면 동기화하지 않음 (localStorage만 사용).

## 2. `lib/firebase.ts` 변경

### 삭제
- `getDeviceId()` — 더 이상 사용하지 않음

### 추가 함수

```typescript
// 가족 코드 관리
function getFamilyCode(): string | null
function setFamilyCode(code: string): void
function clearFamilyCode(): void
function generateFamilyCode(): string

// Firebase 경로가 familyCode 기반으로 변경
function getBasePath(): string | null  // "mrt/families/{familyCode}" 또는 null

// 가족 코드 존재 여부 확인
async function checkFamilyCodeExists(code: string): Promise<boolean>

// 가족 메타 정보 저장
async function saveFamilyMeta(code: string): Promise<void>
```

### `generateFamilyCode()` 구현
```typescript
const ADJECTIVES = ["행복한", "용감한", "빛나는", "씩씩한", "귀여운", "멋진", "착한", "똑똑한"];
const ANIMALS = ["곰돌이", "토끼", "고양이", "강아지", "펭귄", "사자", "코끼리", "여우"];

function generateFamilyCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(1000 + Math.random() * 9000); // 1000~9999
  return `${adj}-${animal}-${num}`;
}
// 예: "행복한-곰돌이-3847"
```

### `saveToFirebase` / `loadFromFirebase` / `subscribeToFirebase` 수정
```typescript
// 기존: mrt/{deviceId}/{path}
// 변경: mrt/families/{familyCode}/{path}
// familyCode가 없으면 → 아무것도 하지 않음 (return)
```

### localStorage 키
```
mrt-family-code: "행복한-곰돌이-3847" | null
mrt-firebase-config: { apiKey, databaseURL, projectId }  // 기존 유지
```

## 3. `lib/sync.ts` 변경

### 현재
```typescript
export async function syncSettings(settings: unknown): Promise<void> {
  await saveToFirebase("settings", settings);
}
```

### 변경
```typescript
// 쓰기 타임스탬프 추적 (무한 루프 방지)
let lastWriteTimestamp = 0;

export async function syncSettings(settings: unknown): Promise<void> {
  lastWriteTimestamp = Date.now();
  await saveToFirebase("settings", {
    data: settings,
    updatedAt: lastWriteTimestamp,
    updatedBy: getDeviceFingerprint(),  // 간단한 기기 식별자
  });
}

export async function syncStats(records: unknown): Promise<void> {
  lastWriteTimestamp = Date.now();
  await saveToFirebase("stats", {
    data: records,
    updatedAt: lastWriteTimestamp,
    updatedBy: getDeviceFingerprint(),
  });
}

// 원격 변경 수신 시 자기 자신의 쓰기인지 확인
export function isOwnWrite(updatedAt: number, updatedBy: string): boolean {
  return updatedBy === getDeviceFingerprint() && Math.abs(updatedAt - lastWriteTimestamp) < 3000;
}

// 기기 식별자 (동기화 루프 방지용, deviceId와 다름)
function getDeviceFingerprint(): string {
  let fp = sessionStorage.getItem("mrt-device-fp");
  if (!fp) {
    fp = `fp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    sessionStorage.setItem("mrt-device-fp", fp);
  }
  return fp;
}
```

### 새 함수: 구독 시작/해제

```typescript
let settingsUnsubscribe: (() => void) | null = null;
let statsUnsubscribe: (() => void) | null = null;

export function startSync(
  onSettingsChange: (settings: AppSettings) => void,
  onStatsChange: (records: DailyRecord[]) => void,
): void {
  stopSync(); // 기존 구독 해제

  settingsUnsubscribe = subscribeToFirebase("settings", (raw) => {
    const { data, updatedAt, updatedBy } = raw as any;
    if (!isOwnWrite(updatedAt, updatedBy) && data) {
      onSettingsChange(data);
    }
  });

  statsUnsubscribe = subscribeToFirebase("stats", (raw) => {
    const { data, updatedAt, updatedBy } = raw as any;
    if (!isOwnWrite(updatedAt, updatedBy) && data) {
      onStatsChange(data);
    }
  });
}

export function stopSync(): void {
  settingsUnsubscribe?.();
  statsUnsubscribe?.();
  settingsUnsubscribe = null;
  statsUnsubscribe = null;
}
```

## 4. Store 변경

### `useSettingsStore.ts` — onRehydrateStorage 수정

```typescript
onRehydrateStorage: () => {
  return (state, error) => {
    if (!error && state) {
      const migrated = migrateSettings(state.settings);
      if (migrated !== state.settings) {
        useSettingsStore.setState({ settings: migrated });
      }

      // 로컬 변경 → Firebase 푸시 (기존)
      useSettingsStore.subscribe((s) => {
        syncSettings(s.settings);
      });

      // Firebase 변경 → 로컬 반영 (신규)
      startSync(
        (remoteSettings) => {
          useSettingsStore.setState({ settings: migrateSettings(remoteSettings) });
        },
        (remoteRecords) => {
          useStatsStore.setState({ records: remoteRecords });
        },
      );
    }
  };
}
```

**설계 판단**: `startSync`를 settings store의 rehydrate에서 호출. stats store는 별도 구독 불필요 — settings 쪽에서 통합 관리.

### `useStatsStore.ts` — 변경 최소화

기존 subscribe(syncStats) 유지. 원격 수신은 settings store에서 통합 처리하므로 stats store 자체는 변경 없음.

## 5. 설정 UI 변경

### `app/settings/page.tsx` — Firebase 섹션 대체

기존 Firebase config 입력 UI를 **가족 코드 중심 UI**로 교체:

```
┌─────────────────────────────────────┐
│  📱 데이터 동기화                    │
│                                      │
│  [Firebase 미설정 시]                │
│  ┌─────────────────────────────┐     │
│  │ Firebase 설정 필요           │     │
│  │ API Key: [________]          │     │
│  │ DB URL:  [________]          │     │
│  │ Project: [________]          │     │
│  │ [설정 저장]                  │     │
│  └─────────────────────────────┘     │
│                                      │
│  [Firebase 설정 완료 + 코드 없음]    │
│  ┌─────────────────────────────┐     │
│  │ [새 가족 코드 만들기]        │     │
│  │ [기존 코드로 합류하기]       │     │
│  └─────────────────────────────┘     │
│                                      │
│  [가족 코드 연결됨]                  │
│  ┌─────────────────────────────┐     │
│  │ 가족 코드: 행복한-곰돌이-3847│     │
│  │ 상태: ● 연결됨               │     │
│  │ [코드 복사] [연결 해제]      │     │
│  └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

### 상태 분기 (3가지)

| 상태 | 조건 | UI |
|------|------|-----|
| Firebase 미설정 | `getFirebaseConfigStored() === null` | Firebase config 입력 폼 |
| Firebase OK + 코드 없음 | config 있음 + `getFamilyCode() === null` | 코드 생성/합류 버튼 |
| 연결됨 | config 있음 + familyCode 있음 | 코드 표시 + 복사/해제 |

### "기존 코드로 합류하기" 플로우
```
1. 코드 입력 다이얼로그 표시
2. 입력 → checkFamilyCodeExists(code) 호출
3. 존재 → loadFromFirebase("settings") → 로컬 store 덮어쓰기
4. 존재 안 함 → "코드를 찾을 수 없습니다" 토스트
5. 성공 → setFamilyCode(code) + startSync() 호출
```

### "새 가족 코드 만들기" 플로우
```
1. generateFamilyCode() → 코드 생성
2. setFamilyCode(code)
3. saveFamilyMeta(code) → Firebase에 메타 저장
4. syncSettings(현재 설정) → 현재 데이터 업로드
5. startSync() 호출
```

## 6. 구현 순서 (의존성 기반)

```
Step 1: lib/firebase.ts
  ├─ getDeviceId() 삭제
  ├─ generateFamilyCode(), getFamilyCode(), setFamilyCode(), clearFamilyCode() 추가
  ├─ checkFamilyCodeExists(), saveFamilyMeta() 추가
  └─ saveToFirebase/loadFromFirebase/subscribeToFirebase → familyCode 기반으로 변경

Step 2: lib/sync.ts
  ├─ 쓰기 타임스탬프 + deviceFingerprint 추가 (무한 루프 방지)
  ├─ startSync(onSettingsChange, onStatsChange) 추가
  └─ stopSync() 추가

Step 3: stores/useSettingsStore.ts
  └─ onRehydrateStorage에서 startSync() 호출

Step 4: app/settings/page.tsx
  ├─ Firebase config 입력 UI 유지
  ├─ 가족 코드 생성/합류/해제 UI 추가
  └─ 3가지 상태 분기 렌더링
```

## 7. 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| Firebase 설정 없이 가족 코드 사용 | 불가 — Firebase 설정이 선행 조건 |
| 같은 코드를 동시에 생성 | 확률 매우 낮음 (8×8×9000 = 576,000 조합). 충돌 시 데이터 병합 (LWW) |
| 두 기기가 동시에 설정 변경 | Last Write Wins — 마지막 쓰기가 우선 |
| 연결 해제 후 재연결 | 로컬 데이터 유지. 재연결 시 원격 데이터로 덮어쓰기 확인 필요 |
| 오프라인 상태 | localStorage에 정상 저장. 온라인 복귀 시 Firebase SDK가 자동 재동기화 |
| 가족 코드 입력 오타 | checkFamilyCodeExists로 검증 → "코드를 찾을 수 없습니다" |
