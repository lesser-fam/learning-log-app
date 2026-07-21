import { DesignState } from "./types";

export const DESIGN_STORAGE_KEY = "learning-log-app:api-design:v1";

export function loadDesign(): DesignState | null {
  try {
    const stored = window.localStorage.getItem(DESIGN_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DesignState) : null;
  } catch {
    return null;
  }
}

export function saveDesign(design: DesignState): void {
  window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design));
}
