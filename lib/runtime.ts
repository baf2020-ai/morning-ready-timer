// 실행 환경 감지 유틸.
// SSR(typeof window === "undefined")에서 호출돼도 안전하게 false 반환.

interface TossWindow {
  Capacitor?: unknown;
  TossApp?: unknown;
  toss?: unknown;
}

export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as TossWindow).Capacitor;
}

// 토스 인앱 WebView 감지. UA 패턴은 토스 콘솔 로그로 확인 후 보정 필요.
// 현재는 보수적으로 "Toss" 키워드 + 브릿지 객체 둘 다 체크.
export function isToss(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Toss/i.test(ua)) return true;
  const w = window as unknown as TossWindow;
  return !!w.TossApp || !!w.toss;
}

export function isInAppWebView(): boolean {
  return isCapacitor() || isToss();
}

export function isWeb(): boolean {
  return !isInAppWebView();
}
