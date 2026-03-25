---
name: server-impl
description: "서버/데이터 구현. 타입 정의, 스토어 설계, 데이터 마이그레이션. Server 에이전트 전용."
---

# Server Implementation — 서버/데이터 구현 스킬

## 절차
1. 데이터 요구사항 분석
2. 타입 정의/수정 (`lib/types.ts`)
3. 상수 추가 (`lib/constants.ts`)
4. 스토어 구현/수정 (`stores/`)
5. 하위호환 검증

## 데이터 아키텍처
```
lib/types.ts        → 타입 정의 (인터페이스)
lib/constants.ts    → 기본값, 상수
stores/
  useSettingsStore  → 설정 (프로필, 태스크, PIN) [persist]
  useGameStore      → 게임 세션 (실시간, 비영속)
  useStatsStore     → 통계 기록 [persist]
```

## 하위호환 패턴
```typescript
// 새 필드 추가 시
interface AppSettings {
  newField?: NewType;  // optional로 추가
}

// 스토어에서 접근 시
const value = state.settings.newField ?? DEFAULT_VALUE;
```
