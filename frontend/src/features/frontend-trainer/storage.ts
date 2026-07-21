import { StoredFrontendDesign } from "./types";

export const FRONTEND_DESIGN_STORAGE_KEY =
  "learning-log-app:frontend-design:v1";

export function loadFrontendDesign(): StoredFrontendDesign | null {
  try {
    const value = window.localStorage.getItem(FRONTEND_DESIGN_STORAGE_KEY);
    return value ? (JSON.parse(value) as StoredFrontendDesign) : null;
  } catch {
    return null;
  }
}

export function saveFrontendDesign(value: StoredFrontendDesign): void {
  window.localStorage.setItem(
    FRONTEND_DESIGN_STORAGE_KEY,
    JSON.stringify(value),
  );
}
