---
name: design
description: "UI/UX 디자인. 화면 설계, 컴포넌트 구조, 스타일 명세. Designer 에이전트 전용."
---

# Design — UI/UX 디자인 스킬

## 절차
1. 기능 명세에서 필요한 화면 식별
2. 화면별 레이아웃 설계
3. 컴포넌트 분해 (재사용 가능한 단위)
4. 스타일 명세 (색상, 크기, 간격, 애니메이션)
5. 반응형 브레이크포인트 정의
6. 인터랙션 명세

## 디자인 시스템 참조
- 색상: `lib/constants.ts` → COLORS
- 폰트: Jua(한글), Fredoka(영문/숫자)
- 카드: `.sticker-card` (비대칭 라운딩 + 하드 섀도우)
- 버튼: `.jelly-btn` (3D 젤리 느낌)
- 애니메이션: `char-idle` (캐릭터 바운스), Framer Motion spring

## 컴포넌트 명세 템플릿
```
## 컴포넌트: {이름}
- 위치: components/{domain}/{Name}.tsx
- Props: { prop1: type, prop2: type }
- 스타일: 색상, 크기, 간격
- 인터랙션: 탭/호버/애니메이션
- 반응형: 모바일(~768) / 데스크톱(768~)
```
