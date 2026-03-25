"use client";

import { useEffect } from "react";

function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as unknown as Record<string, unknown>).Capacitor;
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Capacitor 네이티브 앱에서는 SW 등록 건너뜀
    if (isCapacitor()) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed, ignore in dev
      });
    }
  }, []);

  return null;
}
