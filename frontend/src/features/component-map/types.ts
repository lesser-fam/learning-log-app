import { Edge, Node } from "@xyflow/react";

export type ComponentArea = "header" | "main" | "sidebar" | "footer";

export interface ComponentItem {
  id: string;
  name: string;
  kind: string;
  area: ComponentArea;
  description: string;
  propsMemo: string;
  stateMemo: string;
  filePath: string;
}

export interface PageNodeData extends Record<string, unknown> {
  name: string;
  path: string;
  description: string;
  components: ComponentItem[];
}

export type PageNode = Node<PageNodeData, "page">;

export interface ComponentMapData {
  nodes: PageNode[];
  edges: Edge[];
}

export interface ComponentMapApp extends ComponentMapData {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
}

export interface ComponentMapWorkspace {
  version: 2;
  activeAppId: string;
  apps: ComponentMapApp[];
}
