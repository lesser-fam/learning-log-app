"use client";

import Link from "next/link";
import {
  ChangeEvent,
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Handle,
  MiniMap,
  NodeChange,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import {
  loadComponentMapWorkspace,
  saveComponentMapWorkspace,
} from "@/features/component-map/storage";
import { createInitialComponentMapWorkspace } from "@/features/component-map/templates";
import {
  ComponentArea,
  ComponentItem,
  ComponentMapApp,
  ComponentMapData,
  ComponentMapWorkspace,
  PageNode,
  PageNodeData,
} from "@/features/component-map/types";

const areaLabels: Record<ComponentArea, string> = {
  header: "ヘッダー",
  main: "メイン",
  sidebar: "サイドバー",
  footer: "フッター",
};

interface SelectionContextValue {
  selectComponent: (pageId: string, componentId: string) => void;
}

const SelectionContext = createContext<SelectionContextValue>({
  selectComponent: () => undefined,
});

function PageCardNode({ id, data, selected }: NodeProps<PageNode>) {
  const { selectComponent } = useContext(SelectionContext);
  const areas: ComponentArea[] = ["header", "main", "sidebar", "footer"];

  return (
    <div
      className={`w-[340px] overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition ${selected ? "border-violet-500 shadow-violet-200" : "border-slate-200 shadow-slate-200/70"}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="bg-slate-950 px-4 py-3 text-white">
        <p className="font-mono text-[10px] text-violet-300">{data.path}</p>
        <h3 className="mt-1 text-sm font-black">{data.name}</h3>
      </div>
      <div className="space-y-2 p-3">
        {areas.map((area) => {
          const components = data.components.filter(
            (component) => component.area === area,
          );
          return (
            <div
              key={area}
              className={`rounded-xl border border-dashed p-2 ${area === "main" ? "min-h-24 border-violet-200 bg-violet-50/50" : "border-slate-200 bg-slate-50"}`}
            >
              <p className="mb-1.5 text-[9px] font-black tracking-wider text-slate-400">
                {areaLabels[area]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {components.length === 0 && (
                  <span className="text-[10px] text-slate-300">未配置</span>
                )}
                {components.map((component) => (
                  <button
                    key={component.id}
                    type="button"
                    title={`${component.kind}: ${component.description}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectComponent(id, component.id);
                    }}
                    className="group relative rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-left text-[10px] font-bold text-violet-800 shadow-sm hover:border-violet-500"
                  >
                    {component.name}
                    <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-lg bg-slate-950 p-2 text-left text-[10px] font-normal leading-4 text-white shadow-xl group-hover:block">
                      <strong className="block text-violet-300">
                        {component.kind}
                      </strong>
                      {component.description || "説明はまだありません"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { page: PageCardNode };

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function hasMapData(value: unknown): value is ComponentMapData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ComponentMapData>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

function isComponentMapApp(value: unknown): value is ComponentMapApp {
  if (!hasMapData(value)) return false;
  const candidate = value as Partial<ComponentMapApp>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.repositoryUrl === "string"
  );
}

function isComponentMapWorkspace(
  value: unknown,
): value is ComponentMapWorkspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ComponentMapWorkspace>;
  return (
    candidate.version === 2 &&
    typeof candidate.activeAppId === "string" &&
    Array.isArray(candidate.apps) &&
    candidate.apps.length > 0 &&
    candidate.apps.every(isComponentMapApp)
  );
}

function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "app";
}

function ComponentMapEditor() {
  const [workspace, setWorkspace] = useState<ComponentMapWorkspace>(() =>
    createInitialComponentMapWorkspace(),
  );
  const [storageReady, setStorageReady] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );
  const [newAppName, setNewAppName] = useState("");
  const [newAppRepositoryUrl, setNewAppRepositoryUrl] = useState("");
  const [pageName, setPageName] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [componentName, setComponentName] = useState("");
  const [componentArea, setComponentArea] = useState<ComponentArea>("main");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeApp = useMemo(
    () =>
      workspace.apps.find((app) => app.id === workspace.activeAppId) ??
      workspace.apps[0] ??
      null,
    [workspace.activeAppId, workspace.apps],
  );
  const nodes = useMemo(() => activeApp?.nodes ?? [], [activeApp]);
  const edges = useMemo(() => activeApp?.edges ?? [], [activeApp]);

  const setNodes = useCallback((updater: SetStateAction<PageNode[]>) => {
    setWorkspace((current) => ({
      ...current,
      apps: current.apps.map((app) => {
        if (app.id !== current.activeAppId) return app;
        const nextNodes =
          typeof updater === "function" ? updater(app.nodes) : updater;
        return { ...app, nodes: nextNodes };
      }),
    }));
  }, []);

  const setEdges = useCallback((updater: SetStateAction<Edge[]>) => {
    setWorkspace((current) => ({
      ...current,
      apps: current.apps.map((app) => {
        if (app.id !== current.activeAppId) return app;
        const nextEdges =
          typeof updater === "function" ? updater(app.edges) : updater;
        return { ...app, edges: nextEdges };
      }),
    }));
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange<PageNode>[]) =>
      setNodes((current) => applyNodeChanges(changes, current)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((current) => applyEdgeChanges(changes, current)),
    [setEdges],
  );

  useEffect(() => {
    const initialWorkspace = createInitialComponentMapWorkspace();
    const stored = loadComponentMapWorkspace(initialWorkspace);
    const nextWorkspace = stored ?? initialWorkspace;
    const frame = window.requestAnimationFrame(() => {
      setWorkspace(nextWorkspace);
      const nextApp =
        nextWorkspace.apps.find(
          (app) => app.id === nextWorkspace.activeAppId,
        ) ?? nextWorkspace.apps[0];
      setSelectedPageId(nextApp?.nodes[0]?.id ?? null);
      setStorageReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (storageReady) saveComponentMapWorkspace(workspace);
  }, [storageReady, workspace]);

  const selectedPage = useMemo(
    () => nodes.find((node) => node.id === selectedPageId) ?? null,
    [nodes, selectedPageId],
  );
  const selectedComponent = useMemo(
    () =>
      selectedPage?.data.components.find(
        (component) => component.id === selectedComponentId,
      ) ?? null,
    [selectedComponentId, selectedPage],
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            label: "画面遷移",
          },
          current,
        ),
      ),
    [setEdges],
  );

  const selectComponent = useCallback(
    (pageId: string, componentId: string) => {
      setSelectedPageId(pageId);
      setSelectedComponentId(componentId);
    },
    [],
  );

  function selectApp(appId: string) {
    const nextApp = workspace.apps.find((app) => app.id === appId);
    if (!nextApp) return;

    setWorkspace((current) => ({ ...current, activeAppId: appId }));
    setSelectedPageId(nextApp.nodes[0]?.id ?? null);
    setSelectedComponentId(null);
  }

  function addApp(event: FormEvent) {
    event.preventDefault();
    if (!newAppName.trim()) return;

    const app: ComponentMapApp = {
      id: newId("app"),
      name: newAppName.trim(),
      description: "",
      repositoryUrl: newAppRepositoryUrl.trim(),
      nodes: [],
      edges: [],
    };

    setWorkspace((current) => ({
      ...current,
      activeAppId: app.id,
      apps: [...current.apps, app],
    }));
    setSelectedPageId(null);
    setSelectedComponentId(null);
    setNewAppName("");
    setNewAppRepositoryUrl("");
  }

  function updateActiveApp(updater: (app: ComponentMapApp) => ComponentMapApp) {
    setWorkspace((current) => ({
      ...current,
      apps: current.apps.map((app) =>
        app.id === current.activeAppId ? updater(app) : app,
      ),
    }));
  }

  function deleteActiveApp() {
    if (!activeApp) return;
    if (workspace.apps.length === 1) {
      window.alert("最後のアプリは削除できません。");
      return;
    }
    if (!window.confirm(`「${activeApp.name}」を削除しますか？`)) return;

    const remainingApps = workspace.apps.filter(
      (app) => app.id !== activeApp.id,
    );
    const nextApp = remainingApps[0];

    setWorkspace((current) => ({
      ...current,
      activeAppId: nextApp.id,
      apps: remainingApps,
    }));
    setSelectedPageId(nextApp.nodes[0]?.id ?? null);
    setSelectedComponentId(null);
  }

  function addPage(event: FormEvent) {
    event.preventDefault();
    if (!pageName.trim() || !pagePath.trim()) return;
    const id = newId("page");
    setNodes((current) => [
      ...current,
      {
        id,
        type: "page",
        position: { x: 80 + current.length * 390, y: 100 },
        data: {
          name: pageName.trim(),
          path: pagePath.trim(),
          description: "",
          components: [],
        },
      },
    ]);
    setSelectedPageId(id);
    setSelectedComponentId(null);
    setPageName("");
    setPagePath("");
  }

  function addComponent(event: FormEvent) {
    event.preventDefault();
    if (!selectedPage || !componentName.trim()) return;
    const component: ComponentItem = {
      id: newId("component"),
      name: componentName.trim(),
      kind: "未分類",
      area: componentArea,
      description: "",
      propsMemo: "",
      stateMemo: "",
      filePath: "",
    };
    updatePage(selectedPage.id, (data) => ({
      ...data,
      components: [...data.components, component],
    }));
    setSelectedComponentId(component.id);
    setComponentName("");
  }

  function updatePage(
    pageId: string,
    updater: (data: PageNodeData) => PageNodeData,
  ) {
    setNodes((current) =>
      current.map((node) =>
        node.id === pageId ? { ...node, data: updater(node.data) } : node,
      ),
    );
  }

  function updateComponent<K extends keyof ComponentItem>(
    key: K,
    value: ComponentItem[K],
  ) {
    if (!selectedPage || !selectedComponent) return;
    updatePage(selectedPage.id, (data) => ({
      ...data,
      components: data.components.map((component) =>
        component.id === selectedComponent.id
          ? { ...component, [key]: value }
          : component,
      ),
    }));
  }

  function deleteSelectedComponent() {
    if (!selectedPage || !selectedComponent) return;
    updatePage(selectedPage.id, (data) => ({
      ...data,
      components: data.components.filter(
        (component) => component.id !== selectedComponent.id,
      ),
    }));
    setSelectedComponentId(null);
  }

  function deleteSelectedPage() {
    if (!selectedPage) return;
    setNodes((current) => current.filter((node) => node.id !== selectedPage.id));
    setEdges((current) =>
      current.filter(
        (edge) =>
          edge.source !== selectedPage.id && edge.target !== selectedPage.id,
      ),
    );
    setSelectedPageId(null);
    setSelectedComponentId(null);
  }

  function exportActiveApp() {
    if (!activeApp) return;
    downloadJson(activeApp, `${toFileName(activeApp.name)}-component-map.json`);
  }

  function exportWorkspace() {
    downloadJson(workspace, "all-component-maps.json");
  }

  async function importMap(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as unknown;

      if (isComponentMapWorkspace(data)) {
        setWorkspace(data);
        const nextApp =
          data.apps.find((app) => app.id === data.activeAppId) ?? data.apps[0];
        setSelectedPageId(nextApp?.nodes[0]?.id ?? null);
        setSelectedComponentId(null);
        return;
      }

      if (isComponentMapApp(data)) {
        setWorkspace((current) => {
          const alreadyExists = current.apps.some((app) => app.id === data.id);
          return {
            ...current,
            activeAppId: data.id,
            apps: alreadyExists
              ? current.apps.map((app) => (app.id === data.id ? data : app))
              : [...current.apps, data],
          };
        });
        setSelectedPageId(data.nodes[0]?.id ?? null);
        setSelectedComponentId(null);
        return;
      }

      if (hasMapData(data) && activeApp) {
        updateActiveApp((app) => ({
          ...app,
          nodes: data.nodes,
          edges: data.edges,
        }));
        setSelectedPageId(data.nodes[0]?.id ?? null);
        setSelectedComponentId(null);
        return;
      }

      window.alert("対応しているcomponent-mapのJSONではありません。");
    } catch {
      window.alert("JSONファイルを読み込めませんでした。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <SelectionContext.Provider value={{ selectComponent }}>
      <main className="min-h-screen bg-[#f7f5fb] text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/" className="font-black">
                Learning Log
              </Link>
              <span className="ml-3 text-xs font-bold text-violet-700">
                ページ・コンポーネント構成マップ
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/frontend-trainer"
                className="rounded-xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800"
              >
                フロント実装設計
              </Link>
              <button
                type="button"
                onClick={exportActiveApp}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
              >
                選択中を書き出す
              </button>
              <button
                type="button"
                onClick={exportWorkspace}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
              >
                全アプリを書き出す
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
              >
                JSONを読み込む
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importMap}
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black">画面の部品と導線を見える化する</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              アプリを切り替えながら、ページと部品、画面遷移を管理できます。ページはドラッグ、部品はクリックで編集、ホバーで概要確認ができます。
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
            <aside className="space-y-5">
              <section className="rounded-3xl border border-violet-200 bg-white p-5 shadow-sm">
                <h2 className="font-black">対象アプリ</h2>
                <label className="mt-4 block text-xs font-bold">
                  保存済みアプリ
                  <select
                    className="mt-2 w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-bold"
                    value={activeApp?.id ?? ""}
                    onChange={(event) => selectApp(event.target.value)}
                  >
                    {workspace.apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </label>

                {activeApp && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <EditorField
                      label="アプリ名"
                      value={activeApp.name}
                      onChange={(value) =>
                        updateActiveApp((app) => ({ ...app, name: value }))
                      }
                    />
                    <EditorArea
                      label="アプリの概要"
                      value={activeApp.description}
                      onChange={(value) =>
                        updateActiveApp((app) => ({
                          ...app,
                          description: value,
                        }))
                      }
                    />
                    <EditorField
                      label="GitHub URL"
                      value={activeApp.repositoryUrl}
                      onChange={(value) =>
                        updateActiveApp((app) => ({
                          ...app,
                          repositoryUrl: value,
                        }))
                      }
                    />
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      ページ {activeApp.nodes.length}件・導線 {activeApp.edges.length}件
                    </div>
                    <button
                      type="button"
                      onClick={deleteActiveApp}
                      className="w-full rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700"
                    >
                      このアプリを削除
                    </button>
                  </div>
                )}
              </section>

              <form
                onSubmit={addApp}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-black">新しいアプリを追加</h2>
                <label className="mt-4 block text-xs font-bold">
                  アプリ名
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    value={newAppName}
                    onChange={(event) => setNewAppName(event.target.value)}
                    placeholder="新しいアプリ"
                  />
                </label>
                <label className="mt-3 block text-xs font-bold">
                  GitHub URL（任意）
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    value={newAppRepositoryUrl}
                    onChange={(event) =>
                      setNewAppRepositoryUrl(event.target.value)
                    }
                    placeholder="https://github.com/..."
                  />
                </label>
                <button className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
                  アプリを追加する
                </button>
              </form>

              <form
                onSubmit={addPage}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-black">ページを追加</h2>
                <label className="mt-4 block text-xs font-bold">
                  ページ名
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    value={pageName}
                    onChange={(event) => setPageName(event.target.value)}
                    placeholder="学習記録詳細"
                  />
                </label>
                <label className="mt-3 block text-xs font-bold">
                  URLパス
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm"
                    value={pagePath}
                    onChange={(event) => setPagePath(event.target.value)}
                    placeholder="/learning-logs/[id]"
                  />
                </label>
                <button className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">
                  追加する
                </button>
              </form>

              <form
                onSubmit={addComponent}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-black">選択ページへ部品を追加</h2>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {selectedPage?.data.name ?? "ページを選択してください"}
                </p>
                <label className="mt-4 block text-xs font-bold">
                  コンポーネント名
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    value={componentName}
                    onChange={(event) => setComponentName(event.target.value)}
                    placeholder="LearningLogCard"
                  />
                </label>
                <label className="mt-3 block text-xs font-bold">
                  配置場所
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    value={componentArea}
                    onChange={(event) =>
                      setComponentArea(event.target.value as ComponentArea)
                    }
                  >
                    {Object.entries(areaLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  disabled={!selectedPage}
                  className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  部品を配置する
                </button>
              </form>
            </aside>

            <section className="h-[760px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <ReactFlow
                key={activeApp?.id}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => {
                  setSelectedPageId(node.id);
                  setSelectedComponentId(null);
                }}
                fitView
                minZoom={0.35}
              >
                <Background gap={20} color="#ddd6fe" />
                <Controls />
                <MiniMap
                  nodeColor="#7c3aed"
                  maskColor="rgba(248, 250, 252, 0.8)"
                />
              </ReactFlow>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedComponent && selectedPage ? (
                <div>
                  <p className="text-xs font-black tracking-wider text-violet-700">
                    COMPONENT MEMO
                  </p>
                  <h2 className="mt-2 text-lg font-black">
                    {selectedComponent.name}
                  </h2>
                  <div className="mt-5 space-y-4">
                    <EditorField
                      label="コンポーネント名"
                      value={selectedComponent.name}
                      onChange={(value) => updateComponent("name", value)}
                    />
                    <EditorField
                      label="部品の種類"
                      value={selectedComponent.kind}
                      onChange={(value) => updateComponent("kind", value)}
                    />
                    <label className="block text-xs font-bold">
                      配置場所
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        value={selectedComponent.area}
                        onChange={(event) =>
                          updateComponent(
                            "area",
                            event.target.value as ComponentArea,
                          )
                        }
                      >
                        {Object.entries(areaLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <EditorArea
                      label="何をする部品か"
                      value={selectedComponent.description}
                      onChange={(value) => updateComponent("description", value)}
                    />
                    <EditorArea
                      label="受け取るprops"
                      value={selectedComponent.propsMemo}
                      onChange={(value) => updateComponent("propsMemo", value)}
                    />
                    <EditorArea
                      label="state・イベント"
                      value={selectedComponent.stateMemo}
                      onChange={(value) => updateComponent("stateMemo", value)}
                    />
                    <EditorField
                      label="ファイルパス"
                      value={selectedComponent.filePath}
                      onChange={(value) => updateComponent("filePath", value)}
                    />
                    <button
                      type="button"
                      onClick={deleteSelectedComponent}
                      className="w-full rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700"
                    >
                      この部品を削除
                    </button>
                  </div>
                </div>
              ) : selectedPage ? (
                <div>
                  <p className="text-xs font-black tracking-wider text-violet-700">
                    PAGE MEMO
                  </p>
                  <h2 className="mt-2 text-lg font-black">
                    {selectedPage.data.name}
                  </h2>
                  <div className="mt-5 space-y-4">
                    <EditorField
                      label="ページ名"
                      value={selectedPage.data.name}
                      onChange={(value) =>
                        updatePage(selectedPage.id, (data) => ({
                          ...data,
                          name: value,
                        }))
                      }
                    />
                    <EditorField
                      label="URLパス"
                      value={selectedPage.data.path}
                      onChange={(value) =>
                        updatePage(selectedPage.id, (data) => ({
                          ...data,
                          path: value,
                        }))
                      }
                    />
                    <EditorArea
                      label="ページの役割"
                      value={selectedPage.data.description}
                      onChange={(value) =>
                        updatePage(selectedPage.id, (data) => ({
                          ...data,
                          description: value,
                        }))
                      }
                    />
                    <div className="rounded-xl bg-violet-50 p-3 text-xs leading-5 text-violet-900">
                      配置部品: {selectedPage.data.components.length}個
                    </div>
                    <button
                      type="button"
                      onClick={deleteSelectedPage}
                      className="w-full rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700"
                    >
                      このページを削除
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-sm leading-7 text-slate-400">
                  ページまたはコンポーネントを
                  <br />
                  クリックすると編集できます。
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </SelectionContext.Provider>
  );
}

function EditorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EditorArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default function ComponentMapPage() {
  return (
    <ReactFlowProvider>
      <ComponentMapEditor />
    </ReactFlowProvider>
  );
}
