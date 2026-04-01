import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, type Database } from "firebase/database";

// 기본 Firebase 설정 (앱 내장)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCh0DBt1IJlxOvYmsIF1yVHPndXHOr_1PE",
  authDomain: "ready-timer.firebaseapp.com",
  databaseURL: "https://ready-timer-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ready-timer",
};

// Firebase 설정 - localStorage 우선, 없으면 기본값 사용
function getFirebaseConfig() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mrt-firebase-config");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return DEFAULT_FIREBASE_CONFIG;
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
  db = null;
}

export function clearFirebaseConfig() {
  localStorage.removeItem("mrt-firebase-config");
  db = null;
}

export function getFirebaseConfigStored() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mrt-firebase-config");
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// ── 가족 코드 관리 ──

const ADJECTIVES = ["행복한", "용감한", "빛나는", "씩씩한", "귀여운", "멋진", "착한", "똑똑한"];
const ANIMALS = ["곰돌이", "토끼", "고양이", "강아지", "펭귄", "사자", "코끼리", "여우"];

export function generateFamilyCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${animal}-${num}`;
}

export function getFamilyCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mrt-family-code");
}

export function setFamilyCode(code: string): void {
  localStorage.setItem("mrt-family-code", code);
}

export function clearFamilyCode(): void {
  localStorage.removeItem("mrt-family-code");
}

/** Firebase 기본 경로: mrt/families/{familyCode} */
function getBasePath(): string | null {
  const code = getFamilyCode();
  if (!code) return null;
  return `mrt/families/${code}`;
}

/** 가족 코드 존재 여부 확인 */
export async function checkFamilyCodeExists(code: string): Promise<boolean> {
  const database = initFirebase();
  if (!database) return false;
  try {
    const snapshot = await get(ref(database, `mrt/families/${code}/meta`));
    return snapshot.exists();
  } catch (e) {
    console.warn("[firebase] check family code failed:", e);
    return false;
  }
}

/** 가족 메타 정보 저장 */
export async function saveFamilyMeta(code: string): Promise<void> {
  const database = initFirebase();
  if (!database) return;
  try {
    await set(ref(database, `mrt/families/${code}/meta`), {
      createdAt: new Date().toISOString(),
      code,
    });
  } catch (e) {
    console.warn("[firebase] save family meta failed:", e);
  }
}

/** 데이터 저장 */
export async function saveToFirebase(path: string, data: unknown): Promise<void> {
  const database = initFirebase();
  if (!database) return;
  const basePath = getBasePath();
  if (!basePath) return;

  try {
    await set(ref(database, `${basePath}/${path}`), data);
  } catch (e) {
    console.warn(`[firebase] save ${path} failed:`, e);
  }
}

/** 데이터 로드 */
export async function loadFromFirebase(path: string): Promise<unknown> {
  const database = initFirebase();
  if (!database) return null;
  const basePath = getBasePath();
  if (!basePath) return null;

  try {
    const snapshot = await get(ref(database, `${basePath}/${path}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (e) {
    console.warn(`[firebase] load ${path} failed:`, e);
    return null;
  }
}

/** 특정 가족 코드로 데이터 로드 (합류 시) */
export async function loadFromFamilyCode(code: string, path: string): Promise<unknown> {
  const database = initFirebase();
  if (!database) return null;
  try {
    const snapshot = await get(ref(database, `mrt/families/${code}/${path}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (e) {
    console.warn(`[firebase] load from code ${code}/${path} failed:`, e);
    return null;
  }
}

/** 실시간 구독 */
export function subscribeToFirebase(path: string, callback: (data: unknown) => void): (() => void) | null {
  const database = initFirebase();
  if (!database) return null;
  const basePath = getBasePath();
  if (!basePath) return null;

  const unsubscribe = onValue(ref(database, `${basePath}/${path}`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
  return unsubscribe;
}
