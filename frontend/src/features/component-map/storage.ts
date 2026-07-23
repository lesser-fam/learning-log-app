import { ComponentMapData, ComponentMapWorkspace } from "./types";

export const COMPONENT_MAP_STORAGE_KEY =
  "learning-log-app:component-map-workspace:v2";
export const LEGACY_COMPONENT_MAP_STORAGE_KEY =
  "learning-log-app:component-map:v1";

export function loadComponentMapWorkspace(
  initialWorkspace: ComponentMapWorkspace,
): ComponentMapWorkspace | null {
  try {
    const value = window.localStorage.getItem(COMPONENT_MAP_STORAGE_KEY);
    if (value) {
      const parsed = JSON.parse(value) as ComponentMapWorkspace;
      if (
        parsed.version === 2 &&
        typeof parsed.activeAppId === "string" &&
        Array.isArray(parsed.apps)
      ) {
        return parsed;
      }
    }

    const legacyValue = window.localStorage.getItem(
      LEGACY_COMPONENT_MAP_STORAGE_KEY,
    );
    if (!legacyValue) return null;

    const legacyMap = JSON.parse(legacyValue) as ComponentMapData;
    if (!Array.isArray(legacyMap.nodes) || !Array.isArray(legacyMap.edges)) {
      return null;
    }

    const migratedApps = initialWorkspace.apps.map((app, index) =>
      index === 0
        ? { ...app, nodes: legacyMap.nodes, edges: legacyMap.edges }
        : app,
    );

    return {
      ...initialWorkspace,
      activeAppId: migratedApps[0]?.id ?? initialWorkspace.activeAppId,
      apps: migratedApps,
    };
  } catch {
    return null;
  }
}

export function saveComponentMapWorkspace(
  value: ComponentMapWorkspace,
): void {
  window.localStorage.setItem(COMPONENT_MAP_STORAGE_KEY, JSON.stringify(value));
}
