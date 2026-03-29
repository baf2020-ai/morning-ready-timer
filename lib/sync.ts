/**
 * Data sync module - Firebase Realtime Database
 * Falls back gracefully when Firebase is not configured
 */
import { saveToFirebase } from "./firebase";

export function getSyncUrl(): string | null {
  return null; // deprecated, use Firebase config
}

export function setSyncUrl(_url: string | null) {
  // deprecated
}

export async function syncSettings(settings: unknown): Promise<void> {
  try {
    await saveToFirebase("settings", settings);
  } catch (e) {
    console.warn("[sync] settings sync failed:", e);
  }
}

export async function syncStats(records: unknown): Promise<void> {
  try {
    await saveToFirebase("stats", { records, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn("[sync] stats sync failed:", e);
  }
}
