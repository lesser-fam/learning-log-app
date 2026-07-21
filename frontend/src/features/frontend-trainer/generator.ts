import { DesignState } from "@/features/design-trainer/types";
import {
  FrontendDesignState,
  GeneratedFrontendDesign,
  StateGuide,
} from "./types";

const httpMethod = {
  index: "GET",
  store: "POST",
  show: "GET",
  update: "PATCH",
  destroy: "DELETE",
} as const;

function parsedFields(value: string): Array<{ name: string; type: string }> {
  return value
    .split("\n")
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) return null;
      const name = line.slice(0, separator).trim();
      const type = line.slice(separator + 1).trim();
      return name && type ? { name, type } : null;
    })
    .filter((field): field is { name: string; type: string } => field !== null);
}

function dataType(frontend: FrontendDesignState): string {
  if (frontend.dataShape === "collection") {
    return `${frontend.responseTypeName}[]`;
  }
  if (frontend.dataShape === "single") {
    return frontend.responseTypeName;
  }
  return "null";
}

function endpoint(api: DesignState, frontend: FrontendDesignState): string {
  const base = "${process.env.NEXT_PUBLIC_API_BASE_URL}";
  if (["show", "update", "destroy"].includes(api.action)) {
    return `${base}${api.routePath}/\${${frontend.dependencyName || "id"}}`;
  }
  return `${base}${api.routePath}`;
}

function buildTypeCode(
  api: DesignState,
  frontend: FrontendDesignState,
): string {
  const fields = parsedFields(frontend.responseFields);
  const resource = [
    `type ${frontend.responseTypeName} = {`,
    ...(fields.length
      ? fields.map(({ name, type }) => `  ${name}: ${type};`)
      : ["  // dataに含まれる項目を入力してください" ]),
    "};",
  ].join("\n");

  return [
    resource,
    "",
    `type ${frontend.responseTypeName}ApiResponse = {`,
    ...(api.responseMessage ? ["  message: string;"] : []),
    ...(frontend.dataShape === "none"
      ? []
      : [`  data: ${dataType(frontend)};`]),
    "};",
  ].join("\n");
}

function stateGuidesFor(
  api: DesignState,
  frontend: FrontendDesignState,
): StateGuide[] {
  const guides: StateGuide[] = [];
  if (frontend.dataShape !== "none") {
    guides.push({
      name: frontend.dataVariable,
      initialValue: frontend.dataShape === "collection" ? "[]" : "null",
      changesWhen: "APIからdataを受け取ったとき",
      rerenderResult: "取得した内容を画面に表示する",
    });
  }
  if (frontend.loadingState) {
    guides.push({
      name: "isLoading",
      initialValue: "true",
      changesWhen: "通信開始時と終了時",
      rerenderResult: "読み込み表示と通常表示を切り替える",
    });
  }
  if (frontend.errorState) {
    guides.push({
      name: "error",
      initialValue: "null",
      changesWhen: "通信が失敗したとき、再試行するとき",
      rerenderResult: "エラー表示を出す、または消す",
    });
  }
  if (frontend.formState) {
    guides.push({
      name: "formData",
      initialValue: "{}",
      changesWhen: "入力欄の値を変更したとき",
      rerenderResult: "入力欄へ最新の値を表示する",
    });
  }
  if (frontend.successMessageState) {
    guides.push({
      name: "successMessage",
      initialValue: "null",
      changesWhen: `${httpMethod[api.action]}が成功したとき`,
      rerenderResult: "完了メッセージを表示する",
    });
  }
  return guides;
}

function buildStateCode(frontend: FrontendDesignState): string {
  const lines: string[] = [];
  if (frontend.dataShape === "collection") {
    lines.push(
      `const [${frontend.dataVariable}, set${capitalize(frontend.dataVariable)}] = useState<${frontend.responseTypeName}[]>([]);`,
    );
  } else if (frontend.dataShape === "single") {
    lines.push(
      `const [${frontend.dataVariable}, set${capitalize(frontend.dataVariable)}] = useState<${frontend.responseTypeName} | null>(null);`,
    );
  }
  if (frontend.loadingState)
    lines.push(
      `const [isLoading, setIsLoading] = useState(${frontend.fetchTiming === "event" ? "false" : "true"});`,
    );
  if (frontend.errorState)
    lines.push("const [error, setError] = useState<string | null>(null);");
  if (frontend.formState)
    lines.push("const [formData, setFormData] = useState<Record<string, string>>({});");
  if (frontend.successMessageState)
    lines.push(
      "const [successMessage, setSuccessMessage] = useState<string | null>(null);",
    );
  return lines.join("\n");
}

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : "Data";
}

function fetchFunction(
  api: DesignState,
  frontend: FrontendDesignState,
): string[] {
  const setter = `set${capitalize(frontend.dataVariable)}`;
  const isMutation = ["store", "update", "destroy"].includes(api.action);
  const dependency =
    frontend.fetchTiming === "dependency" && frontend.dependencyName
      ? frontend.dependencyName
      : "";
  const lines = [
    isMutation
      ? "const handleSubmit = async () => {"
      : "const fetchData = useCallback(async () => {",
    ...(frontend.loadingState ? ["  setIsLoading(true);"] : []),
    ...(frontend.errorState ? ["  setError(null);"] : []),
    "",
    "  try {",
    `    const response = await fetch(\`${endpoint(api, frontend)}\`${
      api.action === "index" || api.action === "show"
        ? ""
        : `, {\n      method: "${httpMethod[api.action]}",${api.action !== "destroy" ? '\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify(formData),' : ""}\n    }`
    });`,
    "",
    "    if (!response.ok) {",
    "      throw new Error(\"API request failed\");",
    "    }",
    ...(api.action === "destroy" && api.deleteResponse === "no-content"
      ? frontend.successMessageState
        ? ["", '    setSuccessMessage("削除しました。");']
        : []
      : [
          "",
          `    const result: ${frontend.responseTypeName}ApiResponse = await response.json();`,
          ...(frontend.dataShape !== "none"
            ? [`    ${setter}(result.data);`]
            : []),
          ...(frontend.successMessageState
            ? ["    setSuccessMessage(result.message);"]
            : []),
        ]),
    "  } catch {",
    ...(frontend.errorState
      ? [`    setError("${frontend.pageTitle}の処理に失敗しました。");`]
      : ["    // エラー時の処理を書く"]),
    "  } finally {",
    ...(frontend.loadingState ? ["    setIsLoading(false);"] : []),
    "  }",
    isMutation ? "};" : `}, [${dependency}]);`,
  ];
  return lines;
}

function buildEffectCode(
  api: DesignState,
  frontend: FrontendDesignState,
): string {
  const fn = fetchFunction(api, frontend).join("\n");
  if (frontend.fetchTiming === "event") {
    return [
      "// 登録・更新・削除は、レンダリングをきっかけにせずイベントで実行する",
      fn,
    ].join("\n");
  }
  return [
    fn,
    "",
    "useEffect(() => {",
    "  fetchData();",
    "}, [fetchData]);",
  ].join("\n");
}

function buildConditionCode(frontend: FrontendDesignState): string {
  const lines = ["<main>", `  <h1>${frontend.pageTitle}</h1>`];
  const readyConditions = [
    ...(frontend.loadingState ? ["!isLoading"] : []),
    ...(frontend.errorState ? ["!error"] : []),
  ];
  const ready = readyConditions.length
    ? `${readyConditions.join(" && ")} && `
    : "";
  if (frontend.loadingState)
    lines.push("  {isLoading && <p>読み込み中です...</p>}");
  if (frontend.errorState) {
    lines.push(
      `  {${frontend.loadingState ? "!isLoading && " : ""}error && (`,
    );
    lines.push("    <div>", "      <p>{error}</p>");
    if (frontend.retryEnabled) {
      lines.push(
        `      <button onClick={${frontend.fetchTiming === "event" ? "handleSubmit" : "fetchData"}}>再読み込み</button>`,
      );
    }
    lines.push("    </div>", "  )}");
  }
  if (frontend.emptyState && frontend.dataShape === "collection") {
    lines.push(
      `  {${ready}${frontend.dataVariable}.length === 0 && (`,
      `    <p>${frontend.pageTitle}がありません。</p>`,
      "  )}",
    );
  }
  if (frontend.dataShape === "collection") {
    lines.push(
      `  {${ready}${frontend.dataVariable}.length > 0 && (`,
      "    <ul>",
      `      {${frontend.dataVariable}.map((item) => (`,
      "        <li key={item.id}>{/* 表示したい項目 */}</li>",
      "      ))}",
      "    </ul>",
      "  )}",
    );
  } else if (frontend.dataShape === "single") {
    lines.push(
      `  {${ready}${frontend.dataVariable} && (`,
      "    <section>{/* 1件の内容またはフォーム */}</section>",
      "  )}",
    );
  }
  if (frontend.fetchTiming === "event") {
    lines.push("  <button onClick={handleSubmit}>実行する</button>");
  }
  lines.push("</main>");
  return lines.join("\n");
}

function flowFor(
  api: DesignState,
  frontend: FrontendDesignState,
): string[] {
  const method = httpMethod[api.action];
  if (frontend.fetchTiming === "event") {
    return [
      `${frontend.pagePath}の画面を表示する`,
      frontend.formState ? "入力値が変わるたびにformDataを更新する" : "実行ボタンを表示する",
      `ユーザー操作をきっかけに${method}リクエストを送る`,
      "response.okでHTTP通信の成功を確認する",
      "成功時はレスポンスをstateへ保存する",
      "失敗時はcatchでエラーstateを更新する",
      "finallyで読み込み中を終了する",
    ];
  }
  return [
    `${frontend.pagePath}の最初の画面をレンダリングする`,
    `useEffectを${frontend.fetchTiming === "mount" ? "初回レンダリング後に1回" : `${frontend.dependencyName}が変わった後`}実行する`,
    `${method}リクエストをLaravel APIへ送る`,
    "response.okでHTTP通信の成功を確認する",
    "response.json()でJSONをJavaScriptの値へ変換する",
    `result.dataを${frontend.dataVariable}へ保存する`,
    "stateの変更をReactが検知して画面を再レンダリングする",
    "読み込み中・失敗・0件・成功を条件分岐して表示する",
  ];
}

function testCases(frontend: FrontendDesignState): string[] {
  const tests = ["API成功時に受け取ったdataが表示される"];
  if (frontend.loadingState) tests.unshift("初期表示で読み込み中の表示が出る");
  if (frontend.errorState)
    tests.push("API失敗時にエラーメッセージが表示される");
  if (frontend.emptyState) tests.push("dataが0件の場合に空表示が出る");
  if (frontend.retryEnabled)
    tests.push("再読み込みボタンからAPI取得をやり直せる");
  if (frontend.formState) {
    tests.push("入力操作でformDataが更新される");
    tests.push("送信成功時に完了状態へ変わる");
  }
  return tests;
}

export function generateFrontendDesign(
  api: DesignState,
  frontend: FrontendDesignState,
): GeneratedFrontendDesign {
  const typeCode = buildTypeCode(api, frontend);
  const stateCode = buildStateCode(frontend);
  const effectCode = buildEffectCode(api, frontend);
  const conditionCode = buildConditionCode(frontend);
  const hooks = ["useState"];
  if (frontend.fetchTiming !== "event") hooks.unshift("useCallback", "useEffect");
  const needsRouteParameter = ["show", "update", "destroy"].includes(
    api.action,
  );
  const pageCode = [
    '"use client";',
    "",
    `import { ${hooks.join(", ")} } from "react";`,
    ...(needsRouteParameter ? ['import { useParams } from "next/navigation";'] : []),
    "",
    typeCode,
    "",
    `export default function ${frontend.componentName}() {`,
    ...(needsRouteParameter
      ? [
          `  const params = useParams<{ ${frontend.dependencyName || "id"}: string }>();`,
          `  const ${frontend.dependencyName || "id"} = params.${frontend.dependencyName || "id"};`,
        ]
      : []),
    ...stateCode.split("\n").map((line) => `  ${line}`),
    "",
    ...effectCode.split("\n").map((line) => `  ${line}`),
    "",
    "  return (",
    ...conditionCode.split("\n").map((line) => `    ${line}`),
    "  );",
    "}",
  ].join("\n");

  return {
    action: api.action,
    flow: flowFor(api, frontend),
    stateGuides: stateGuidesFor(api, frontend),
    typeCode,
    stateCode,
    effectCode,
    conditionCode,
    pageCode,
    tests: testCases(frontend),
  };
}
