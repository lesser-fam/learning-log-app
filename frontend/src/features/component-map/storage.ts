import { ComponentMapData } from "./types";

export const COMPONENT_MAP_STORAGE_KEY = "learning-log-app:component-map:v1";

export function loadComponentMap(): ComponentMapData | null {
  try {
    const value = window.localStorage.getItem(COMPONENT_MAP_STORAGE_KEY);
    return value ? (JSON.parse(value) as ComponentMapData) : null;
  } catch {
    return null;
  }
}

export function saveComponentMap(value: ComponentMapData): void {
  window.localStorage.setItem(COMPONENT_MAP_STORAGE_KEY, JSON.stringify(value));
}
