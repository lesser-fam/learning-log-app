import {
  CrudAction,
  DesignState,
  GeneratedDesign,
  GeneratedTestCase,
} from "./types";

const httpMethod: Record<CrudAction, string> = {
  index: "GET",
  store: "POST",
  show: "GET",
  update: "PATCH",
  destroy: "DELETE",
};

const statusCode: Record<CrudAction, number> = {
  index: 200,
  store: 201,
  show: 200,
  update: 200,
  destroy: 200,
};

function splitValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseValidationRules(
  value: string,
): Array<{ field: string; rules: string }> {
  return value
    .split("\n")
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) return null;
      const field = line.slice(0, separator).trim();
      const rules = line.slice(separator + 1).trim();
      return field && rules ? { field, rules } : null;
    })
    .filter((rule): rule is { field: string; rules: string } => rule !== null);
}

function routeFor(state: DesignState): string {
  if (state.action === "index" || state.action === "store") {
    return state.routePath;
  }

  return `${state.routePath}/{${state.routeParameter}}`;
}

function apiRouteFor(state: DesignState): string {
  return `/api${routeFor(state)}`.replace(/\/+/g, "/");
}

function phpArray(items: string[]): string {
  return items.length ? items.map((item) => `'${item}'`).join(", ") : "";
}

function messageFor(state: DesignState): string {
  const messages: Record<CrudAction, string> = {
    index: `${state.resourceLabel}一覧を取得しました。`,
    store: `${state.resourceLabel}を登録しました。`,
    show: `${state.resourceLabel}を取得しました。`,
    update: `${state.resourceLabel}を更新しました。`,
    destroy: `${state.resourceLabel}を削除しました。`,
  };

  return messages[state.action];
}

function buildRouteCode(state: DesignState): string {
  const method =
    state.action === "update"
      ? state.updateMethod
      : httpMethod[state.action].toLowerCase();
  const middleware = state.authentication ? "->middleware('auth:sanctum')" : "";

  return `Route::${method}('${routeFor(state)}', [${state.controllerName}::class, '${state.action}'])${middleware};`;
}

function buildIndexController(state: DesignState): string {
  const lines = [
    `public function index(): JsonResponse`,
    `{`,
    `    $query = ${state.modelName}::query();`,
  ];

  if (state.ownership) {
    lines.push("", "    $query->whereBelongsTo(request()->user());");
  }

  if (state.searchEnabled) {
    const columns = splitValues(state.searchColumns);
    const first = columns[0] || "name";
    const operator = state.searchMode === "partial" ? "like" : "=";
    const value = state.searchMode === "partial" ? `"%{$search}%"` : "$search";

    lines.push(
      "",
      `    $query->when(request('${state.searchParameter}'), function ($query, string $search) {`,
    );
    lines.push(`        $query->where('${first}', '${operator}', ${value})`);
    columns.slice(1).forEach((column) => {
      lines.push(`            ->orWhere('${column}', '${operator}', ${value})`);
    });
    lines[lines.length - 1] = `${lines[lines.length - 1]};`;
    lines.push("    });");
  }

  lines.push("", `    $${state.pluralVariable} = $query`);
  lines.push(
    `        ->orderBy${state.sortDirection === "desc" ? "Desc" : ""}('${state.sortField}')`,
  );
  if (state.secondarySortEnabled) {
    lines.push(
      `        ->orderBy${state.secondarySortDirection === "desc" ? "Desc" : ""}('${state.secondarySortField}')`,
    );
  }
  lines.push(
    state.fetchMode === "paginate"
      ? `        ->paginate(${state.perPage});`
      : "        ->get();",
  );

  lines.push("", "    return response()->json([");
  if (state.responseMessage) {
    lines.push(`        'message' => '${messageFor(state)}',`);
  }
  lines.push(
    `        'data' => $${state.pluralVariable},`,
    "    ], 200);",
    "}",
  );

  return lines.join("\n");
}

function ownershipLine(state: DesignState): string[] {
  if (!state.ownership) return [];

  return [
    `    abort_unless($${state.singularVariable}->user_id === request()->user()->id, 403);`,
    "",
  ];
}

function buildStoreController(state: DesignState): string {
  const createLine = state.transaction
    ? `    $${state.singularVariable} = DB::transaction(\n        fn () => ${state.modelName}::create($validated)\n    );`
    : `    $${state.singularVariable} = ${state.modelName}::create($validated);`;

  return [
    `public function store(${state.requestClass} $request): JsonResponse`,
    `{`,
    "    $validated = $request->validated();",
    ...(state.ownership
      ? ["    $validated['user_id'] = $request->user()->id;", ""]
      : []),
    "",
    createLine,
    "",
    "    return response()->json([",
    ...(state.responseMessage
      ? [`        'message' => '${messageFor(state)}',`]
      : []),
    `        'data' => $${state.singularVariable},`,
    "    ], 201);",
    "}",
  ].join("\n");
}

function bindingParameter(state: DesignState): string {
  return state.lookupMode === "binding"
    ? `${state.modelName} $${state.singularVariable}`
    : `int $${state.routeParameter}`;
}

function lookupLines(state: DesignState): string[] {
  return state.lookupMode === "find-or-fail"
    ? [
        `    $${state.singularVariable} = ${state.modelName}::findOrFail($${state.routeParameter});`,
        "",
      ]
    : [];
}

function buildShowController(state: DesignState): string {
  const eagerLoads = splitValues(state.eagerLoads);
  return [
    `public function show(${bindingParameter(state)}): JsonResponse`,
    `{`,
    ...lookupLines(state),
    ...ownershipLine(state),
    ...(eagerLoads.length
      ? [`    $${state.singularVariable}->load([${phpArray(eagerLoads)}]);`, ""]
      : []),
    "    return response()->json([",
    ...(state.responseMessage
      ? [`        'message' => '${messageFor(state)}',`]
      : []),
    `        'data' => $${state.singularVariable},`,
    "    ], 200);",
    "}",
  ].join("\n");
}

function buildUpdateController(state: DesignState): string {
  const updateLines = [
    "    $validated = $request->validated();",
    "",
    state.transaction
      ? `    DB::transaction(fn () => $${state.singularVariable}->update($validated));`
      : `    $${state.singularVariable}->update($validated);`,
  ];

  return [
    `public function update(${state.requestClass} $request, ${bindingParameter(state)}): JsonResponse`,
    `{`,
    ...lookupLines(state),
    ...ownershipLine(state),
    ...updateLines,
    "",
    "    return response()->json([",
    ...(state.responseMessage
      ? [`        'message' => '${messageFor(state)}',`]
      : []),
    `        'data' => $${state.singularVariable}->refresh(),`,
    "    ], 200);",
    "}",
  ].join("\n");
}

function buildDestroyController(state: DesignState): string {
  const returnLines =
    state.deleteResponse === "no-content"
      ? ["    return response()->noContent();"]
      : [
          "    return response()->json([",
          `        'message' => '${messageFor(state)}',`,
          "    ], 200);",
        ];

  return [
    `public function destroy(${bindingParameter(state)}): ${state.deleteResponse === "no-content" ? "Response" : "JsonResponse"}`,
    `{`,
    ...lookupLines(state),
    ...ownershipLine(state),
    `    $${state.singularVariable}->delete();`,
    "",
    ...returnLines,
    "}",
  ].join("\n");
}

function buildControllerCode(state: DesignState): string {
  switch (state.action) {
    case "index":
      return buildIndexController(state);
    case "store":
      return buildStoreController(state);
    case "show":
      return buildShowController(state);
    case "update":
      return buildUpdateController(state);
    case "destroy":
      return buildDestroyController(state);
  }
}

function buildRequestCode(state: DesignState): string | null {
  if (state.action !== "store" && state.action !== "update") return null;
  const configuredRules = parseValidationRules(state.validationRules);
  const fields = configuredRules.length
    ? configuredRules
    : splitValues(state.inputFields).map((field) => ({
        field,
        rules: state.action === "store" ? "required" : "sometimes",
      }));

  return [
    `public function rules(): array`,
    `{`,
    "    return [",
    ...fields.map(({ field, rules }) => {
      const remainingRules = rules.replace(/^required\|?/, "");
      const outputRules =
        state.action === "update" && !rules.includes("sometimes")
          ? ["sometimes", remainingRules].filter(Boolean).join("|")
          : rules;
      return `        '${field}' => '${outputRules}',`;
    }),
    "    ];",
    "}",
  ].join("\n");
}

function testCasesFor(state: DesignState): GeneratedTestCase[] {
  const tests: GeneratedTestCase[] = [];
  const route = apiRouteFor(state);

  if (state.action === "index") {
    tests.push({
      category: "正常系",
      title: `${state.resourceLabel}を指定した順番で一覧取得できる`,
      steps: [
        "並び順を確認できる複数のテストデータを作る",
        `${route}へGETする`,
        "200 OKとレスポンス件数を確認する",
        `${state.sortField}が${state.sortDirection === "desc" ? "降順" : "昇順"}であることを確認する`,
      ],
    });
    tests.push({
      category: "境界値",
      title: "0件の場合は空配列を返す",
      steps: [
        "DBを空にする",
        `${route}へGETする`,
        "200 OKとdataが空配列であることを確認する",
      ],
    });
    if (state.searchEnabled) {
      tests.push({
        category: "正常系",
        title: "検索条件に一致するデータだけ取得できる",
        steps: [
          "一致するデータと一致しないデータを作る",
          `${route}?${state.searchParameter}=検索語へGETする`,
          "一致するデータだけがdataに含まれることを確認する",
        ],
      });
    }
    if (state.fetchMode === "paginate") {
      tests.push({
        category: "境界値",
        title: "指定件数でページネーションされる",
        steps: [
          `${state.perPage + 1}件以上のデータを作る`,
          `${route}へGETする`,
          `1ページのdataが最大${state.perPage}件で、ページ情報を含むことを確認する`,
        ],
      });
    }
  }

  if (state.action === "store") {
    tests.push({
      category: "正常系",
      title: `有効な入力で${state.resourceLabel}を登録できる`,
      steps: [
        "有効なリクエストデータを作る",
        `${route}へPOSTする`,
        "201 Createdを確認する",
        "DBの保存内容を確認する",
      ],
    });
    tests.push({
      category: "異常系",
      title: "必須項目がない場合は登録できない",
      steps: [
        "必須項目を1つ省略する",
        `${route}へPOSTする`,
        "422と対象項目のerrorsを確認する",
        "DBに保存されていないことを確認する",
      ],
    });
  }

  if (state.action === "show") {
    tests.push({
      category: "正常系",
      title: `指定した${state.resourceLabel}を1件取得できる`,
      steps: [
        "テストデータを作る",
        "作成したIDを含むURLへGETする",
        "200 OKと同じIDのdataを確認する",
      ],
    });
    tests.push({
      category: "異常系",
      title: "存在しないIDは404を返す",
      steps: [
        "存在しないIDをURLへ指定する",
        "GETする",
        "404 Not Foundを確認する",
      ],
    });
  }

  if (state.action === "update") {
    tests.push({
      category: "正常系",
      title: `有効な入力で${state.resourceLabel}を更新できる`,
      steps: [
        "更新対象を作る",
        "変更データを送る",
        "200 OKとレスポンスを確認する",
        "DBが更新されたことを確認する",
      ],
    });
    tests.push({
      category: "異常系",
      title: "不正な入力では更新できない",
      steps: [
        "ルールに反する変更データを作る",
        "更新リクエストを送る",
        "422とerrorsを確認する",
        "DBが変更されていないことを確認する",
      ],
    });
    tests.push({
      category: "異常系",
      title: "存在しないIDは404を返す",
      steps: ["存在しないIDへ更新リクエストを送る", "404 Not Foundを確認する"],
    });
  }

  if (state.action === "destroy") {
    tests.push({
      category: "正常系",
      title: `${state.resourceLabel}を削除できる`,
      steps: [
        "削除対象を作る",
        "DELETEリクエストを送る",
        `${state.deleteResponse === "no-content" ? "204 No Content" : "200 OK"}を確認する`,
        `${state.deleteMode === "soft" ? "論理削除" : "DBから削除"}されたことを確認する`,
      ],
    });
    tests.push({
      category: "異常系",
      title: "存在しないIDは404を返す",
      steps: ["存在しないIDへDELETEする", "404 Not Foundを確認する"],
    });
  }

  if (state.authentication) {
    tests.push({
      category: "権限",
      title: "未ログインでは操作できない",
      steps: [
        "ログインしていない状態でリクエストする",
        "401 Unauthorizedを確認する",
      ],
    });
  }

  if (state.ownership && state.action !== "index" && state.action !== "store") {
    tests.push({
      category: "権限",
      title: "他のユーザーのデータは操作できない",
      steps: [
        "別ユーザーのデータを作る",
        "ログインユーザーとしてリクエストする",
        "403 Forbiddenを確認する",
      ],
    });
  }

  if (state.ownership && state.action === "index") {
    tests.push({
      category: "権限",
      title: "他のユーザーのデータを一覧に含めない",
      steps: [
        "ログインユーザーと別ユーザーのデータを作る",
        "一覧取得する",
        "ログインユーザーのデータだけ返ることを確認する",
      ],
    });
  }

  if (state.ownership && state.action === "store") {
    tests.push({
      category: "権限",
      title: "登録データにログインユーザーを設定する",
      steps: [
        "ユーザーとしてログインする",
        "登録リクエストを送る",
        "DBのuser_idがログインユーザーのIDであることを確認する",
      ],
    });
  }

  return tests;
}

function buildTestCode(state: DesignState): string {
  const route = apiRouteFor(state).replace(
    `{${state.routeParameter}}`,
    `{$${state.singularVariable}->id}`,
  );
  const method =
    state.action === "update"
      ? `${state.updateMethod}Json`
      : `${httpMethod[state.action].toLowerCase()}Json`;
  const requestArgument =
    state.action === "store" || state.action === "update" ? ", $payload" : "";
  const expectedStatus =
    state.action === "destroy" && state.deleteResponse === "no-content"
      ? 204
      : statusCode[state.action];
  const fields = splitValues(state.inputFields);
  const firstField = fields[0] || "name";
  const payload = fields.length
    ? [
        "    $payload = [",
        ...fields.map((field) => {
          if (
            field.includes("date") ||
            field.endsWith("_on") ||
            field.endsWith("_at")
          ) {
            return `        '${field}' => now()->toDateString(),`;
          }
          if (field.endsWith("_id")) return `        '${field}' => 1,`;
          if (field.includes("email"))
            return `        '${field}' => 'test@example.com',`;
          return `        '${field}' => 'テスト値',`;
        }),
        "    ];",
      ].join("\n")
    : "    $payload = [\n        // FormRequestを通る有効な値を入力\n    ];";
  const setup =
    state.action === "index"
      ? `    ${state.modelName}::factory()->count(3)->create();`
      : state.action === "store"
        ? payload
        : `    $${state.singularVariable} = ${state.modelName}::factory()->create();`;
  const updatePayload = state.action === "update" ? `\n${payload}` : "";

  return [
    `public function test_${state.action}_succeeds(): void`,
    `{`,
    setup,
    updatePayload,
    "",
    `    $response = $this->${method}("${route}"${requestArgument});`,
    "",
    `    $response->assertStatus(${expectedStatus});`,
    ...(state.action === "index"
      ? [`    $response->assertJsonCount(3, 'data');`]
      : state.action === "destroy"
        ? state.deleteMode === "soft"
          ? [`    $this->assertSoftDeleted($${state.singularVariable});`]
          : [
              `    $this->assertDatabaseMissing('${state.routePath.replace(/^\//, "").replace(/-/g, "_")}', [`,
              `        'id' => $${state.singularVariable}->id,`,
              "    ]);",
            ]
        : state.action === "store"
          ? [
              `    $response->assertJsonPath('data.${firstField}', $payload['${firstField}']);`,
              `    $this->assertDatabaseHas('${state.routePath.replace(/^\//, "").replace(/-/g, "_")}', $payload);`,
            ]
          : [
              `    $response->assertJsonPath('data.id', $${state.singularVariable}->id);`,
            ]),
    "}",
  ].join("\n");
}

function summaries(state: DesignState) {
  const request = [
    `${httpMethod[state.action]} ${apiRouteFor(state)}で受け取る`,
    state.action === "store" || state.action === "update"
      ? `${state.requestClass}でリクエストボディを検証する`
      : "リクエストボディは使用しない",
  ];
  if (state.authentication) request.push("ログイン済みユーザーだけ受け付ける");

  const database = [`${state.modelName}モデルを使用する`];
  if (state.action === "index") {
    if (state.searchEnabled)
      database.push(`${state.searchColumns}を検索対象にする`);
    database.push(
      `${state.sortField}の${state.sortDirection === "desc" ? "降順" : "昇順"}で並べる`,
    );
    database.push(
      state.fetchMode === "paginate"
        ? `${state.perPage}件ずつ取得する`
        : "全件取得する",
    );
  } else if (state.action === "store")
    database.push("検証済みデータから新しい1件を作る");
  else if (state.action === "show")
    database.push(
      `${state.lookupMode === "binding" ? "ルートモデルバインディング" : "findOrFail"}で指定された1件を取得する`,
    );
  else if (state.action === "update")
    database.push(
      `${state.lookupMode === "binding" ? "ルートモデルバインディング" : "findOrFail"}で取得した1件を更新する`,
    );
  else
    database.push(`${state.deleteMode === "soft" ? "論理" : "物理"}削除する`);

  const status =
    state.action === "destroy" && state.deleteResponse === "no-content"
      ? 204
      : statusCode[state.action];
  const response = [`成功時はHTTP ${status}を返す`];
  if (state.action !== "destroy" || state.deleteResponse !== "no-content")
    response.push("JSONレスポンスを返す");
  if (state.action !== "index" && state.action !== "store")
    response.push("対象が存在しない場合は404を返す");
  if (state.action === "store" || state.action === "update")
    response.push("入力に問題がある場合は422とerrorsを返す");

  return { request, database, response };
}

function flowFor(state: DesignState): string[] {
  const flow = [
    `${httpMethod[state.action]} ${apiRouteFor(state)}でリクエストを受け取る`,
    `${state.controllerName}の${state.action}メソッドを呼び出す`,
  ];
  if (state.authentication) flow.push("認証済みユーザーか確認する");
  if (state.action === "store" || state.action === "update")
    flow.push(`${state.requestClass}で入力を検証する`);
  if (state.ownership && state.action === "index")
    flow.push("ログインユーザーが所有するデータだけに絞り込む");
  if (state.ownership && state.action === "store")
    flow.push("ログインユーザーのIDを登録データに加える");
  if (state.ownership && state.action !== "index" && state.action !== "store")
    flow.push("対象データがログインユーザーの所有物か確認する");
  if (state.action === "index") {
    flow.push(`${state.modelName}モデルで検索を組み立てる`);
    if (state.searchEnabled)
      flow.push(`入力された${state.searchParameter}を使って絞り込む`);
    flow.push(
      `${state.sortField}を${state.sortDirection === "desc" ? "降順" : "昇順"}にする`,
    );
    if (state.secondarySortEnabled)
      flow.push(`${state.secondarySortField}を第2の並び順にする`);
    flow.push(
      state.fetchMode === "paginate"
        ? `${state.perPage}件ずつ取得する`
        : "get()で全件取得する",
    );
  } else if (state.action === "store")
    flow.push(`検証済みデータを使って${state.resourceLabel}を登録する`);
  else if (state.action === "show")
    flow.push(
      `${state.lookupMode === "binding" ? "ルートモデルバインディング" : "findOrFail"}で${state.resourceLabel}を取得する`,
    );
  else if (state.action === "update")
    flow.push(`検証済みデータを使って${state.resourceLabel}を更新する`);
  else
    flow.push(
      `${state.resourceLabel}を${state.deleteMode === "soft" ? "論理" : "物理"}削除する`,
    );

  const status =
    state.action === "destroy" && state.deleteResponse === "no-content"
      ? 204
      : statusCode[state.action];
  flow.push(
    `${state.action === "destroy" && state.deleteResponse === "no-content" ? "空のレスポンス" : "JSON"}をHTTP ${status}で返す`,
  );
  return flow;
}

export function generateDesign(state: DesignState): GeneratedDesign {
  const summary = summaries(state);
  const considerations = [
    "レスポンス形式を他のAPIと統一できているか",
    "想定されるデータ件数に対して全件取得で問題ないか",
    "エラーメッセージに内部情報を含めていないか",
  ];
  if (!state.authentication)
    considerations.push("この操作にログイン制限が必要ないか");
  if (state.action === "store" || state.action === "update")
    considerations.push("一意制約と業務上の重複条件が必要ないか");
  if (state.action === "destroy")
    considerations.push("関連データがある場合の削除ルールを決めたか");

  return {
    requestSummary: summary.request,
    databaseSummary: summary.database,
    responseSummary: summary.response,
    flow: flowFor(state),
    tests: testCasesFor(state),
    routeCode: buildRouteCode(state),
    controllerCode: buildControllerCode(state),
    requestCode: buildRequestCode(state),
    testCode: buildTestCode(state),
    considerations,
  };
}
