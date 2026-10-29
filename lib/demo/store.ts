import { createDemoSeed } from "./seed";
import type { DemoDatabase } from "./types";
export const DEMO_STORAGE_KEY = "talentscreen.frontend-preview.v1";
export const DEMO_CHANGE_EVENT = "talentscreen:preview-change";
let memory: DemoDatabase | null = null;
export function getDemoDatabase(): DemoDatabase {
  if (typeof window === "undefined")
    throw new Error("Frontend preview data is available in the browser only.");
  if (memory) return memory;
  try {
    const text = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (text) {
      const parsed: unknown = JSON.parse(text);
      if (isDatabase(parsed)) {
        memory = parsed;
        return memory;
      }
    }
  } catch {
    /* Storage may be unavailable in restricted browser contexts. */
  }
  memory = createDemoSeed();
  persist(memory);
  return memory;
}
function isDatabase(value: unknown): value is DemoDatabase {
  if (!value || typeof value !== "object") return false;
  const db = value as Partial<DemoDatabase>;
  return (
    db.schemaVersion === 1 &&
    typeof db.revision === "number" &&
    (db.sessionUserId === null || typeof db.sessionUserId === "string") &&
    [
      "users",
      "jobs",
      "candidates",
      "profiles",
      "applications",
      "assessments",
      "assignments",
      "screenings",
      "notifications",
    ].every((key) => Array.isArray((value as Record<string, unknown>)[key]))
  );
}
function persist(db: DemoDatabase) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* In-memory mode still supports the review flows. */
  }
}
export function updateDemoDatabase<T>(
  change: (database: DemoDatabase) => T,
): T {
  const next = structuredClone(getDemoDatabase());
  const result = change(next);
  next.revision += 1;
  memory = next;
  persist(next);
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
  return structuredClone(result);
}
export function readDemoDatabase<T>(read: (database: DemoDatabase) => T): T {
  return structuredClone(read(getDemoDatabase()));
}
export function endDemoSession() {
  updateDemoDatabase((db) => {
    db.sessionUserId = null;
    return null;
  });
}
export function resetDemoDatabase() {
  memory = createDemoSeed();
  persist(memory);
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}
export function demoUser() {
  const db = getDemoDatabase();
  return db.users.find((u) => u.id === db.sessionUserId) || null;
}
