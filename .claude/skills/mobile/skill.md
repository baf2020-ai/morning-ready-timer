---
name: mobile-build
description: "모바일 빌드/배포. Capacitor sync, iOS/Android 실행, 스토어 배포 준비. Mobile 에이전트 전용."
---

# Mobile Build — 모바일 빌드/배포 스킬

## 빌드 & 실행
```bash
# iOS 시뮬레이터
npx next build && npx cap sync ios && npx cap run ios --target {DEVICE_ID}

# Android 에뮬레이터
npx next build && npx cap sync android && npx cap run android --target {DEVICE_ID}

# 디바이스 목록 확인
xcrun simctl list devices available | grep iPhone
```

## WKWebView 호환 체크리스트
웹 → 모바일 포팅 시 반드시 확인:
- [ ] SVG에 feTurbulence/feDisplacementMap 필터 없는지
- [ ] 이모지 대신 SVG 아이콘 사용하는지
- [ ] CSS 알파값이 inline rgba()로 되어있는지
- [ ] 에셋 경로가 상대경로(`./ `)인지
- [ ] safe-area-inset 패딩 적용되어있는지
- [ ] Google Fonts에 fallback 폰트 있는지

## 스토어 배포 준비
### iOS (App Store)
1. Xcode에서 Signing & Capabilities 설정
2. 앱 아이콘 세트 (1024x1024 필수)
3. 스크린샷 (6.7", 6.5", 5.5" 등)
4. App Store Connect에서 앱 정보 입력
5. Archive → Upload to App Store

### Android (Google Play)
1. `android/app/build.gradle`에서 versionCode/versionName 설정
2. keystore 생성 및 서명
3. AAB 빌드: `./gradlew bundleRelease`
4. Google Play Console에서 앱 등록
