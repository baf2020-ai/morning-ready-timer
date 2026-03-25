---
name: frontend-impl
description: "프론트엔드 구현. Next.js 페이지, React 컴포넌트, 스타일링, 애니메이션. Frontend 에이전트 전용."
---

# Frontend Implementation — 프론트엔드 구현 스킬

## 절차
1. 디자인 명세 확인
2. 타입 정의 (`lib/types.ts`)
3. 상수/색상 추가 (`lib/constants.ts`)
4. 컴포넌트 구현 (`components/`)
5. 페이지 구현 (`app/`)
6. 스토어 연동 (`stores/`)
7. 빌드 확인 (`npx next build`)

## 코드 컨벤션
- 파일명: PascalCase (컴포넌트), camelCase (유틸)
- "use client" 필수 (클라이언트 컴포넌트)
- inline style에 COLORS 상수 사용
- Tailwind 클래스 + style={{ }} 혼합 가능
- Framer Motion: whileTap, whileHover, animate
- Zustand selector: `useStore((s) => s.field)` 개별 구독

## 주의사항
- `node_modules/next/dist/docs/` 가이드 먼저 확인
- CSS @import는 Tailwind 뒤에 올 수 없음 → layout.tsx에서 link 태그 사용
- Zustand `now` 필드를 구독해야 타이머 리렌더링됨
- localStorage 기존 데이터에 새 필드 없을 수 있음 → safeGet 패턴
