---
name: orchestrate
description: "팀 오케스트레이션. 기능 요청을 팀별 작업으로 분배하고 워크플로우를 조율. Triggers: 팀, 작업분배, 워크플로우, orchestrate, 개발시작"
---

# Orchestrate — 팀 워크플로우 오케스트레이터

기능 요청을 받아 팀별 작업으로 분배하고 순서를 조율합니다.

## 워크플로우

### 1. 요구사항 분석 (PM)
```
사용자 요청 → PM 에이전트가 기능 명세 작성
```

### 2. 병렬 설계 (Designer + Server)
```
기능 명세 → Designer: 화면 설계
         → Server: 데이터 모델 + API 설계
```

### 3. 구현 (Frontend)
```
화면 설계 + API 명세 → Frontend: 구현
```

### 4. 검증 (QA)
```
구현 완료 → QA: 빌드 + 기능 + 엣지케이스 테스트
```

### 5. 배포
```
QA 통과 → 빌드 → Cloudflare Pages 배포
```

## 시나리오별 에이전트 구성

| 시나리오 | 에이전트 | 패턴 |
|---------|---------|------|
| 새 기능 추가 | PM → Designer + Server → Frontend → QA | 팬아웃/팬인 |
| UI 개선 | Designer → Frontend → QA | 파이프라인 |
| 버그 수정 | QA(분석) → Frontend/Server → QA(검증) | 생성-검증 |
| 데이터 구조 변경 | PM → Server → Frontend → QA | 파이프라인 |
| 디자인 리뉴얼 | Designer → Frontend → QA | 파이프라인 |
| 모바일 빌드/배포 | Frontend → Mobile → QA | 파이프라인 |
| 모바일 호환 이슈 | QA(분석) → Mobile + Frontend → QA(검증) | 생성-검증 |

## 에이전트 호출

기능 요청 시 아래 순서로 에이전트를 호출:

1. `@pm` — 기능 명세 작성
2. `@designer` — 화면 설계 (필요시)
3. `@server` — 데이터/API 설계 (필요시)
4. `@frontend` — 웹 구현
5. `@mobile` — 모바일 빌드/호환성 (필요시)
6. `@qa` — 검증
