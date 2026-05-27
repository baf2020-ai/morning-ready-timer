"use client";

import { useEffect } from "react";
import { isInAppWebView } from "@/lib/runtime";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Capacitor 네이티브 앱과 토스 인앱 WebView에서는 SW 등록 건너뜀
    if (isInAppWebView()) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed, ignore in dev
      });
    }
  }, []);

  return null;
}
