import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, type Database } from "firebase/database";

// Firebase 설정 - 환경변수 또는 localStorage에서 로드
function getFirebaseConfig() {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("mrt-firebase-config");
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
}

let db: Database | null = null;

export function initFirebase(): Database | null {
  if (db) return db;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    db = getDatabase(app);
    return db;
  } catch (e) {
    console.warn("[firebase] init failed:", e);
    return null;
  }
}

export function setFirebaseConfig(config: {
  apiKey: string;
  databaseURL: string;
  projectId: string;
}) {
  localStorage.setItem("mrt-firebase-config", JSON.stringify(config));
  db = null; // reset so next call re-initializes
}

export function clearFirebaseConfig() {
  localStorage.removeItem("mrt-firebase-config");
  db = null;
}

export function getFirebaseConfigStored() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mrt-firebase-config");
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
}

// 디바이스별 고유 ID (기기간 구분)
function getDeviceId(): string {
  let id = localStorage.getItem("mrt-device-id");
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("mrt-device-id", id);
  }
  return id;
}

/** 데이터 저장 */
export async function saveToFirebase(path: string, data: unknown): Promise<void> {
  const database = initFirebase();
  if (!database) return;

  try {
    const deviceId = getDeviceId();
    await set(ref(database, `mrt/${deviceId}/${path}`), data);
  } catch (e) {
    console.warn(`[firebase] save ${path} failed:`, e);
  }
}

/** 데이터 로드 */
export async function loadFromFirebase(path: string): Promise<unknown> {
  const database = initFirebase();
  if (!database) return null;

  try {
    const deviceId = getDeviceId();
    const snapshot = await get(ref(database, `mrt/${deviceId}/${path}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (e) {
    console.warn(`[firebase] load ${path} failed:`, e);
    return null;
  }
}

/** 실시간 구독 */
export function subscribeToFirebase(path: string, callback: (data: unknown) => void): (() => void) | null {
  const database = initFirebase();
  if (!database) return null;

  const deviceId = getDeviceId();
  const unsubscribe = onValue(ref(database, `mrt/${deviceId}/${path}`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
  return unsubscribe;
}
