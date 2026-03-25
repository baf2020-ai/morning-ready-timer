# UI Redesign - "AI 느낌 탈출" 디자인 설계서

> 참고 앱: Toca Boca, Sago Mini, Pok Pok, Khan Academy Kids, Duolingo Kids

## 1. 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **손그림 느낌** | 완벽한 벡터 대신 약간 불규칙한 선, 손으로 그린 듯한 질감 |
| **비대칭 레이아웃** | 기계적 정렬 대신 의도적 비대칭, 살짝 기울어진 요소 |
| **촉감 있는 텍스처** | Flat 배경 대신 종이질감, 크레용 느낌의 배경 |
| **과감한 타이포** | 둥글고 뚱뚱한 아동용 전용 폰트 |
| **캐릭터 중심** | UI 요소보다 캐릭터가 주인공 |

## 2. 색상 팔레트 (완전 교체)

### Before (AI 팔레트)
```
#FF6B6B (coral) + #4ECDC4 (teal) + #FFE66D (yellow) + #FFF9E6 (cream)
```

### After (키즈 트렌드 팔레트 - "놀이터")
```css
/* 메인 색상 - 따뜻하고 채도 조절된 색상 */
--color-sunshine:    #FFAD42;  /* 메인 포인트: 따뜻한 오렌지옐로 */
--color-blueberry:   #6C5CE7;  /* 보조 포인트: 보라 (아이들이 좋아하는 색 1위) */
--color-strawberry:  #E84393;  /* 액센트: 딸기핑크 */
--color-mint:        #00B894;  /* 성공/완료: 민트 그린 */

/* 배경 색상 - 크림색 종이 느낌 */
--bg-paper:          #FFF8F0;  /* 메인 배경: 따뜻한 아이보리 */
--bg-paper-alt:      #F8F0FF;  /* 보라 틴트 배경 (설정 등) */

/* 캐릭터별 테마 */
--char-bunny:   #FF8FA3;  /* 로즈핑크 */
--char-bear:    #8CC152;  /* 라임그린 */
--char-cat:     #54A0FF;  /* 스카이블루 */
--char-penguin: #A29BFE;  /* 라벤더 */

/* 뉴트럴 */
--text-dark:    #2B2040;  /* 다크퍼플 (순수 검정 대신) */
--text-sub:     #8B7FA8;  /* 서브텍스트: 연보라 */
--card-bg:      #FFFFFF;
--card-shadow:  rgba(108, 92, 231, 0.08);  /* 보라 틴트 그림자 */
```

### 색상 선택 근거
- 보라(#6C5CE7): 4-7세 아동 선호 색상 1위 (특히 여아), 남아도 높은 선호도
- 오렌지옐로(#FFAD42): 에너지, 아침, 햇살 연상 - 앱 테마와 일치
- 딸기핑크(#E84393): 활기와 보상 느낌, Toca Boca 스타일
- 민트(#00B894): 완료/성공 피드백에 자연스러운 색상

## 3. 타이포그래피

### Before
```css
font-family: "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
```

### After
```css
/* 영문/숫자 - 둥글고 뚱뚱한 아동용 서체 */
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');

/* 한글 - 둥근 느낌의 서체 */
@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');

font-family: "Jua", "Fredoka", sans-serif;
```

- **Jua (주아)**: 둥글둥글 귀여운 한글 폰트, 아동 앱에 적합
- **Fredoka**: Duolingo가 사용하는 둥근 영문 폰트, 숫자 표현에 최적

## 4. 배경 & 텍스처

### Before
```css
background: linear-gradient(180deg, #FFF9E6 0%, #FFE8CC 100%);
```

### After - 페이지별 배경
```css
/* 홈: 하늘+구름+언덕 일러스트 배경 */
.home-bg {
  background-color: #FFF8F0;
  background-image:
    /* 구름 패턴 (CSS로 구현) */
    radial-gradient(ellipse 120px 40px at 15% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(ellipse 90px 30px at 75% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(ellipse 100px 35px at 45% 12%, rgba(255,255,255,0.7) 0%, transparent 100%),
    /* 언덕 */
    radial-gradient(ellipse 200% 40% at 50% 110%, #C8E6C9 0%, transparent 60%);
}

/* 종이 텍스처 노이즈 (SVG filter) */
.paper-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  pointer-events: none;
}
```

## 5. 홈 화면 레이아웃 재설계

### Before (기계적 대칭)
```
      [타이틀 중앙]
  [혼자하기]  [같이하기]   ← 균등 2열
      [설정 버튼 중앙]
```

### After (캐릭터 중심, 비대칭, 놀이터 느낌)
```
   ☁️         ☁️
      준비 히어로!          ← 살짝 기울어진 타이틀 (-2deg)
     오늘도 출발~!

  ┌─────────────────────┐
  │ 🐰 유미   🐻 유찬   │  ← 캐릭터가 크게, 바닥에 서있는 느낌
  │ [시작!]   [시작!]    │     물결 모양 구분선
  │                     │
  │    🤝 같이하기!      │  ← 하단에 두 캐릭터가 손잡은 모습
  └─────────────────────┘

         ⚙️ 설정          ← 우하단에 작게
```

### 핵심 변경
- 타이틀에 `-2deg` 회전으로 손글씨 느낌
- 캐릭터를 160px로 크게 표시 (현재 80px)
- 캐릭터 아래에 작은 그림자(타원) 추가로 "서있는" 느낌
- 카드 대신 배경 위에 직접 배치
- 물결(wave) SVG 구분선으로 섹션 나누기
- 버튼에 약간의 회전(1~3deg)과 손그림 테두리

## 6. 카드 & 버튼 스타일

### Before (기본 카드)
```css
rounded-3xl shadow-lg bg-white  /* 모든 곳에 동일한 카드 */
```

### After (스티커/말풍선 느낌)
```css
/* 캐릭터 선택 버튼 - 스티커 느낌 */
.sticker-btn {
  background: white;
  border: 3px solid var(--color-blueberry);
  border-radius: 24px 24px 24px 8px;  /* 비대칭 라운딩 */
  box-shadow:
    4px 4px 0px var(--color-blueberry),  /* 하드 섀도우 (입체 스티커) */
    0 8px 24px rgba(108, 92, 231, 0.1);
  transform: rotate(-1deg);  /* 살짝 기울임 */
  transition: transform 0.2s;
}
.sticker-btn:active {
  transform: rotate(0deg) scale(0.95);
  box-shadow: 2px 2px 0px var(--color-blueberry);  /* 눌린 느낌 */
}

/* CTA 버튼 - 젤리 느낌 */
.jelly-btn {
  background: var(--color-sunshine);
  border: none;
  border-radius: 9999px;
  padding: 12px 32px;
  font-weight: 700;
  color: white;
  box-shadow:
    0 4px 0 #E09030,  /* 하단 두꺼운 그림자 (3D 젤리) */
    0 6px 12px rgba(255, 173, 66, 0.3);
  transform: translateY(0);
  transition: transform 0.1s, box-shadow 0.1s;
}
.jelly-btn:active {
  transform: translateY(3px);
  box-shadow:
    0 1px 0 #E09030,
    0 2px 4px rgba(255, 173, 66, 0.2);
}
```

## 7. 캐릭터 SVG 개선

### Before
- 완벽한 원/타원 기반 기하학적 도형
- `strokeWidth: 2` 균일한 선

### After
- SVG path에 약간의 불규칙성 추가 (hand-drawn filter)
- 선 두께 변화 (`strokeWidth` 2~4 사이 변동)
- 캐릭터 idle 애니메이션 (위아래 살짝 bounce)

```css
/* 캐릭터 idle 바운스 */
@keyframes char-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.character-idle {
  animation: char-bounce 2s ease-in-out infinite;
}

/* SVG 손그림 필터 */
<filter id="hand-drawn">
  <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
</filter>
```

## 8. 이모지 → 커스텀 일러스트 교체

| 현재 (이모지) | 변경 (커스텀 SVG) |
|--------------|------------------|
| ☀️ (타이틀) | 웃는 해 SVG (눈+입 달린 카툰 해) |
| 🏠 (시작점) | 귀여운 집 일러스트 SVG |
| 🏫 (도착점) | 유치원 건물 일러스트 SVG |
| ⭐ (별점) | 반짝이는 별 SVG + 획득시 회전 애니메이션 |
| ⚙️ (설정) | 기어 SVG (캐릭터 색상 매칭) |

## 9. 타이머 화면 재설계

### Before
- 단순 원형 SVG 타이머 + 숫자
- 회색 배경 원 + 컬러 진행 원

### After
- 원형 타이머를 **모래시계** 또는 **해시계** 컨셉으로
- 시간 경과에 따라 해가 움직이는 시각적 표현
- 카운트다운 숫자에 Fredoka 폰트로 굵고 둥근 느낌

```
     🌅 ← 해가 왼→오로 이동
  ╭─────────────────╮
  │   [큰 숫자]      │  ← 남은 시간
  │    2:30          │
  │                  │
  │  ═══════●═══     │  ← 진행 바 (해 아이콘이 이동)
  ╰─────────────────╯
```

## 10. Progress Road 재설계

### Before
- 직선 + 원형 노드 + 이모지

### After - 구불구불 길 (Candy Crush 스타일)
```
  🏠 집
   ╲
    ○ 이불개기
     ╲
      ● 밥먹기    ← 현재 (캐릭터 위치, 큰 원 + 펄스 애니메이션)
       ╱
      ○ 양치
     ╱
    ○ 옷입기
   ╱
  🏫 유치원
```

- S자 곡선 path로 구불구불한 길
- 완료 노드: 별 모양 + 체크
- 현재 노드: 펄스 애니메이션 + 캐릭터
- 미완료 노드: 점선 원
- 길 위에 작은 꽃/나무 장식

## 11. 애니메이션 개선

### Before (기본 모션)
```js
whileTap={{ scale: 0.95 }}
whileHover={{ scale: 1.05 }}
```

### After (과장된, 탄성있는 모션)
```js
// 버튼 탭 - 젤리 바운스
whileTap={{ scale: 0.9, rotate: -2 }}
transition={{ type: "spring", stiffness: 400, damping: 10 }}

// 완료 시 - 뿅! 효과
animate={{ scale: [0, 1.3, 1], rotate: [0, 10, -5, 0] }}
transition={{ duration: 0.5, ease: "easeOut" }}

// 캐릭터 등장 - 통통 튀기
animate={{ y: [100, -20, 10, -5, 0] }}
transition={{ duration: 0.8, ease: "easeOut" }}

// 별 획득 - 회전하며 커지기
animate={{ scale: [0, 1.5, 1], rotate: [0, 360] }}
transition={{ duration: 0.6 }}
```

## 12. 사운드 피드백 강화

| 액션 | 현재 | 개선 |
|------|------|------|
| 버튼 탭 | tap 사운드 | "뽁" 거품 터지는 소리 |
| 태스크 완료 | 없음 | "딩~" + 별 사운드 |
| 전체 완료 | 없음 | 팡파레 + 환호성 |
| 오버타임 | 없음 | 부드러운 "틱톡" 경고음 |

## 13. 컴플리트 화면 재설계

### Before
- 컨페티 + 별점 + 통계

### After
- 캐릭터가 왕관/트로피 들고 점프하는 애니메이션
- 별이 하나씩 "뿅뿅" 나타남 (stagger)
- 배경에 무지개 아치
- "대단해!", "멋져!", "최고!" 등 랜덤 칭찬 문구가 말풍선으로
- 컨페티를 종이 조각 대신 별/하트/리본 모양으로

## 14. 구현 우선순위

| 순서 | 항목 | 영향도 | 난이도 |
|------|------|--------|--------|
| 1 | 색상 팔레트 교체 | 높음 | 낮음 |
| 2 | 폰트 교체 (Jua + Fredoka) | 높음 | 낮음 |
| 3 | 홈 화면 레이아웃 재설계 | 높음 | 중간 |
| 4 | 카드/버튼 스타일 (스티커+젤리) | 높음 | 낮음 |
| 5 | 배경 텍스처 & 구름/언덕 | 중간 | 낮음 |
| 6 | 캐릭터 idle 애니메이션 | 중간 | 낮음 |
| 7 | 이모지 → SVG 아이콘 교체 | 중간 | 중간 |
| 8 | 타이머 화면 개선 | 중간 | 중간 |
| 9 | Progress Road S자 곡선 | 낮음 | 높음 |
| 10 | 컴플리트 화면 재설계 | 낮음 | 중간 |
