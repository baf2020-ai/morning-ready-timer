/**
 * Data sync module - Firebase Realtime Database (양방향)
 * Falls back gracefully when Firebase/familyCode is not configured
 */
import { saveToFirebase, subscribeToFirebase } from "./firebase";
import type { AppSettings, DailyRecord } from "./types";

// 기기 식별자 (세션 단위, 무한 루프 방지용)
function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  let fp = sessionStorage.getItem("mrt-device-fp");
  if (!fp) {
    fp = `fp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    sessionStorage.setItem("mrt-device-fp", fp);
  }
  return fp;
}

// 마지막 쓰기 타임스탬프 (자기 쓰기 감지)
let lastSettingsWrite = 0;
let lastStatsWrite = 0;

function isOwnWrite(updatedAt: number, updatedBy: string, lastWrite: number): boolean {
  return updatedBy === getDeviceFingerprint() && Math.abs(updatedAt - lastWrite) < 3000;
}

/** 설정 동기화 (로컬 → Firebase) */
export async function syncSettings(settings: unknown): Promise<void> {
  try {
    lastSettingsWrite = Date.now();
    await saveToFirebase("settings", {
      data: settings,
      updatedAt: lastSettingsWrite,
      updatedBy: getDeviceFingerprint(),
    });
  } catch (e) {
    console.warn("[sync] settings sync failed:", e);
  }
}

/** 통계 동기화 (로컬 → Firebase) */
export async function syncStats(records: unknown): Promise<void> {
  try {
    lastStatsWrite = Date.now();
    await saveToFirebase("stats", {
      data: records,
      updatedAt: lastStatsWrite,
      updatedBy: getDeviceFingerprint(),
    });
  } catch (e) {
    console.warn("[sync] stats sync failed:", e);
  }
}

// 구독 해제 함수
let settingsUnsubscribe: (() => void) | null = null;
let statsUnsubscribe: (() => void) | null = null;

/** 양방향 실시간 동기화 시작 */
export function startSync(
  onSettingsChange: (settings: AppSettings) => void,
  onStatsChange: (records: DailyRecord[]) => void,
): void {
  stopSync();

  settingsUnsubscribe = subscribeToFirebase("settings", (raw) => {
    try {
      const envelope = raw as { data?: unknown; updatedAt?: number; updatedBy?: string };
      if (!envelope.data) return;
      if (isOwnWrite(envelope.updatedAt ?? 0, envelope.updatedBy ?? "", lastSettingsWrite)) return;
      onSettingsChange(envelope.data as AppSettings);
    } catch (e) {
      console.warn("[sync] settings receive failed:", e);
    }
  });

  statsUnsubscribe = subscribeToFirebase("stats", (raw) => {
    try {
      const envelope = raw as { data?: unknown; updatedAt?: number; updatedBy?: string };
      if (!envelope.data) return;
      if (isOwnWrite(envelope.updatedAt ?? 0, envelope.updatedBy ?? "", lastStatsWrite)) return;
      onStatsChange(envelope.data as DailyRecord[]);
    } catch (e) {
      console.warn("[sync] stats receive failed:", e);
    }
  });
}

/** 동기화 중단 */
export function stopSync(): void {
  settingsUnsubscribe?.();
  statsUnsubscribe?.();
  settingsUnsubscribe = null;
  statsUnsubscribe = null;
}

// deprecated
export function getSyncUrl(): string | null { return null; }
export function setSyncUrl(_url: string | null) { /* noop */ }
