# 모바일 앱 출시 체크리스트

브랜치 `release/mobile-launch`에서 자동화 가능한 코드 변경은 끝났습니다. 아래 항목은
스토어 콘솔/Xcode/Android Studio에서 사람이 직접 수행해야 합니다.

---

## 코드/리포에서 자동 처리된 항목

- [x] iOS Info.plist — iPhone 세로 고정 (`UISupportedInterfaceOrientations` 단일값)
- [x] iOS Info.plist — `ITSAppUsesNonExemptEncryption=NO` (TestFlight/App Store 업로드 시 암호화 신고 면제)
- [x] AndroidManifest — `android:screenOrientation="portrait"`
- [x] ServiceWorker — Capacitor 네이티브에서는 등록 건너뜀 (`components/ServiceWorkerRegister.tsx`)
- [x] `/privacy` 라우트 — 앱 동작에 맞춘 한국어 처리방침 초안
- [x] 설정 화면에 개인정보 처리방침 링크 추가
- [x] 사용하지 않는 Next 기본 SVG(public/{next,vercel,window,globe,file}.svg) 제거
- [x] `npm run build:release` 스크립트 — `next build` 후 dev 프리뷰 라우트(out/apple-preview·__apple-preview·icon-preview) 제거
- [x] `cap:sync`/`cap:ios`/`cap:android` 스크립트가 release 빌드를 사용하도록 변경

---

## 사용자가 직접 처리해야 하는 항목

### A. 사업자/연락처 정보 채우기

- [ ] `app/privacy/page.tsx`의 `PROVIDER_NAME`, `PROVIDER_CONTACT` 상수를 실제 운영자명·이메일로 교체
- [ ] 처리방침을 공개 URL(예: GitHub Pages, 회사 사이트)에도 게시 — App Store/Play Console에 URL 등록 필요

### B. 버전/빌드 번호

- [ ] iOS Xcode → App target → General
  - Marketing Version (예: `1.0.0`) ↔ Info.plist의 `CFBundleShortVersionString`
  - Build (예: `1`) ↔ `CFBundleVersion`
- [ ] Android `android/app/build.gradle`
  - `versionCode 1`, `versionName "1.0"` 부터 시작. 새 빌드마다 `versionCode`는 반드시 증가

### C. 아이콘 & 스플래시 (iOS)

- [ ] `ios/App/App/Assets.xcassets/AppIcon.appiconset/` — 1024×1024 마케팅 아이콘 포함 모든 사이즈 채우기
  - 빠른 길: [appicon.co](https://appicon.co) 또는 Xcode의 단일 1024 슬롯 사용 (iOS 14+)
- [ ] `Assets.xcassets/Splash.imageset/` — 스플래시 배경 이미지 (기존 `LaunchScreen.storyboard` 그대로 사용해도 OK)

### D. 아이콘 (Android)

- [ ] `android/app/src/main/res/mipmap-*/ic_launcher*.png` — `xxxhdpi`까지 모든 dpi 교체
  - Android Studio → 우클릭 res → New → Image Asset 사용 권장 (adaptive icon 생성)
- [ ] adaptive icon 전경/배경 별도 지정 (Play Console 권장)

### E. Xcode 프로젝트 설정

- [ ] Signing & Capabilities
  - Team 선택 (Apple Developer 멤버십 필요)
  - Bundle Identifier: `com.bombom.morningready` 확인
  - Automatically manage signing 켜고 provisioning profile 생성
- [ ] Deployment Info → iOS Deployment Target — Capacitor 8 권장 최소 iOS 14.0 이상 확인
- [ ] Build → Archive → Distribute App → App Store Connect

### F. Android Studio / Play Console 설정

- [ ] `android/app/build.gradle` 의 `compileSdkVersion`, `targetSdkVersion` — Play 정책 최신 요구 충족 (현재 정책: targetSdk 34 이상)
- [ ] 서명 키 생성 (`keytool -genkey`) → `~/.gradle/gradle.properties` 또는 keystore 파일 보관
- [ ] `./gradlew bundleRelease` → `app-release.aab` 생성 → Play Console 업로드
- [ ] Internal testing → Closed testing → Production 트랙 순서 권장

### G. 스토어 콘솔 메타데이터

App Store Connect:
- [ ] 앱 이름, 부제, 키워드, 설명 (KR/EN)
- [ ] 스크린샷: iPhone 6.7" (필수), iPhone 5.5" (선택), iPad 12.9" (iPad 지원 시 필수)
- [ ] 앱 카테고리: Education 또는 Lifestyle
- [ ] 연령 등급 설문 — 폭력/공포 등 없음 4+ 예상
- [ ] 개인정보 처리방침 URL
- [ ] App Privacy 설문 — 본 앱은 데이터 수집 없음 (가족 코드 사용 시 사용자 컨텐츠를 Firebase 저장) 항목 응답

Play Console:
- [ ] 앱 제목, 짧은 설명, 자세한 설명
- [ ] 그래픽: 아이콘 512×512, 피쳐 그래픽 1024×500, 스크린샷 최소 2장
- [ ] 콘텐츠 등급 설문 → IARC
- [ ] 개인정보 처리방침 URL
- [ ] Data safety 양식 — 위치/연락처/식별자 수집 없음, 사용자 컨텐츠는 선택적 Firebase 사용 명시
- [ ] 타겟 사용자 — 만 6세 이상 권장 (아이용 앱 정책 적용 여부 검토)

### H. 사전 점검 (스토어 거부 사유 줄이기)

- [ ] iPhone/iPad 실기기 또는 시뮬레이터에서 홈 → 솔로 → 듀얼 → 완료 → 통계 → 설정 흐름 정상
- [ ] 음소거 토글, PIN 잠금, 가족 코드 생성/합류, 처음부터 다시 시작 정상
- [ ] 다크 모드/접근성 글자 크기 변경 시 깨짐 없음
- [ ] 백그라운드 → 포그라운드 복귀 시 타이머 상태 정상
- [ ] 비행기 모드에서 동기화 미설정 사용자 기준 동작 정상 (오프라인 우선)
- [ ] iPad 가로/세로 회전 시 레이아웃 정상 (iPhone은 세로 고정)

---

## 권장 후속 작업 (출시 후)

- 분석 / 크래시 리포트 (Sentry, Firebase Crashlytics) 추가
- App Tracking Transparency 면제 명시 (광고 추적 안 함)
- 가족 코드 동기화 충돌 정책 정리 (현재는 마지막 쓰기 우선)
