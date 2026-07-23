import type {
  DevelopmentPattern,
  Technology,
} from "@/features/pattern-library/types";

export const technologies: Technology[] = [
  {
    id: "laravel",
    label: "Laravel API",
    shortLabel: "Laravel",
    description:
      "リクエストを受け取り、検証・DB操作・JSONレスポンスまでを組み立てる型",
    color: "bg-rose-600",
  },
  {
    id: "nextjs",
    label: "Next.js",
    shortLabel: "Next.js",
    description:
      "URL、page.tsx、データ取得、画面遷移を結びつけるための型",
    color: "bg-slate-900",
  },
  {
    id: "react",
    label: "React",
    shortLabel: "React",
    description:
      "stateの変化をきっかけに、表示とユーザー操作を管理する型",
    color: "bg-cyan-600",
  },
  {
    id: "typescript",
    label: "TypeScript",
    shortLabel: "TypeScript",
    description:
      "データの形と取り得る状態を型で表し、間違いを実行前に見つける型",
    color: "bg-blue-600",
  },
];

export const patterns: DevelopmentPattern[] = [
  {
    id: "laravel-index",
    technology: "laravel",
    action: "index",
    title: "一覧取得API",
    summary: "複数件を検索・並び替えして配列で返す。",
    useWhen: "一覧画面、履歴画面、管理画面へ複数レコードを渡したいとき。",
    mentalModel: "条件を決める → Query Builderを組む → 複数件取得 → 200で返す",
    flow: [
      "GETリクエストを受け取る",
      "検索・絞り込み条件を取得する",
      "Query Builderへ条件と並び順を追加する",
      "get()またはpaginate()で取得する",
      "dataを配列として200で返す",
    ],
    buildingBlocks: [
      "Route::get",
      "Controller@index",
      "Model::query()",
      "where / orderBy / paginate",
      "JsonResponse",
    ],
    branches: [
      { condition: "データが0件", result: "空配列を200で返す" },
      { condition: "検索条件がある", result: "when()などでwhereを追加する" },
      { condition: "件数が多い", result: "paginate()で分割する" },
    ],
    questions: [
      "誰のデータまで取得してよいか？",
      "並び順と第2ソートは何か？",
      "0件は正常か？",
      "ページネーションは必要か？",
    ],
    codeLabel: "Query Builderの最小例",
    code: `public function index(): JsonResponse
{
    $logs = LearningLog::query()
        ->orderByDesc('studied_on')
        ->orderByDesc('id')
        ->get();

    return response()->json(['data' => $logs], 200);
}`,
    checklist: [
      "0件で空配列になる",
      "想定した順番で返る",
      "他ユーザーのデータが混ざらない",
      "件数増加時の負荷を考えた",
    ],
    searchKeywords: [
      "Laravel query builder orderBy",
      "Laravel pagination API resource",
    ],
  },
  {
    id: "laravel-store",
    technology: "laravel",
    action: "store",
    title: "新規登録API",
    summary: "入力を検証し、新しいレコードを1件保存する。",
    useWhen: "登録フォームから新しいデータを作成したいとき。",
    mentalModel: "受け取る → 検証する → 保存する → 作成データを201で返す",
    flow: [
      "POSTリクエストを受け取る",
      "FormRequestで認可と入力検証を行う",
      "validated()で検証済みデータだけ取得する",
      "Model::create()で保存する",
      "作成したデータを201で返す",
    ],
    buildingBlocks: [
      "Route::post",
      "Store〇〇Request",
      "authorize / rules",
      "validated",
      "Model::create",
      "$fillable",
    ],
    branches: [
      { condition: "入力不備", result: "errors付きの422を返す" },
      { condition: "権限がない", result: "403を返す" },
      { condition: "保存成功", result: "作成データを201で返す" },
    ],
    questions: [
      "必須・任意・nullableはどれか？",
      "重複を許可するか？",
      "ユーザーIDなどサーバー側で補う値はあるか？",
      "一括代入してよいカラムはどれか？",
    ],
    codeLabel: "登録処理の最小例",
    code: `public function store(StoreLearningLogRequest $request): JsonResponse
{
    $validated = $request->validated();
    $learningLog = LearningLog::create($validated);

    return response()->json([
        'message' => '登録しました。',
        'data' => $learningLog,
    ], 201);
}`,
    checklist: [
      "正常時に201になる",
      "必須不足で422になる",
      "不正なカラムを保存しない",
      "DBにも正しく保存される",
    ],
    searchKeywords: [
      "Laravel FormRequest validation",
      "Laravel mass assignment fillable",
    ],
  },
  {
    id: "laravel-show",
    technology: "laravel",
    action: "show",
    title: "詳細取得API",
    summary: "URLのIDに対応するレコードを1件返す。",
    useWhen: "詳細画面や編集画面の初期値へ1件のデータを渡したいとき。",
    mentalModel: "IDを受け取る → 1件探す → 所有者確認 → 200で返す",
    flow: [
      "GET /resources/{id}を受け取る",
      "Route Model Bindingで対象を取得する",
      "必要ならPolicyで閲覧権限を確認する",
      "関連データを読み込む",
      "1件を200で返す",
    ],
    buildingBlocks: [
      "Route Model Binding",
      "Controller@show",
      "Policy",
      "load / with",
      "JsonResponse",
    ],
    branches: [
      { condition: "IDが存在しない", result: "Laravelが404を返す" },
      { condition: "他人のデータ", result: "Policyなどで403または404を返す" },
      { condition: "存在する", result: "対象データを200で返す" },
    ],
    questions: [
      "存在しない場合はどう表示するか？",
      "誰でも閲覧してよいか？",
      "関連データも必要か？",
      "非公開項目をレスポンスへ含めていないか？",
    ],
    codeLabel: "Route Model Bindingの最小例",
    code: `public function show(LearningLog $learningLog): JsonResponse
{
    return response()->json([
        'data' => $learningLog,
    ], 200);
}`,
    checklist: [
      "存在するIDで200になる",
      "存在しないIDで404になる",
      "返してはいけない項目がない",
      "所有者確認が必要なら実装した",
    ],
    searchKeywords: [
      "Laravel route model binding",
      "Laravel policy authorize resource",
    ],
  },
  {
    id: "laravel-update",
    technology: "laravel",
    action: "update",
    title: "更新API",
    summary: "既存レコードを検証済みの入力で変更する。",
    useWhen: "編集フォームから既存データを上書きしたいとき。",
    mentalModel: "対象取得 → 権限確認 → 更新用検証 → update → 最新値を200で返す",
    flow: [
      "PATCH /resources/{id}を受け取る",
      "Route Model Bindingで対象を取得する",
      "更新権限を確認する",
      "Update FormRequestで検証する",
      "update()して最新値を200で返す",
    ],
    buildingBlocks: [
      "Route::patch",
      "Update〇〇Request",
      "sometimes",
      "Policy",
      "update / refresh",
    ],
    branches: [
      { condition: "対象なし", result: "404を返す" },
      { condition: "入力不備", result: "422を返す" },
      { condition: "権限なし", result: "403を返す" },
      { condition: "更新成功", result: "最新データを200で返す" },
    ],
    questions: [
      "PUTとPATCHのどちらか？",
      "変更可能な項目はどれか？",
      "変更されなかった項目を維持できるか？",
      "同時更新の競合を考える必要があるか？",
    ],
    codeLabel: "部分更新の最小例",
    code: `public function update(
    UpdateLearningLogRequest $request,
    LearningLog $learningLog,
): JsonResponse {
    $learningLog->update($request->validated());

    return response()->json([
        'data' => $learningLog->refresh(),
    ], 200);
}`,
    checklist: [
      "変更対象だけ更新できる",
      "未指定項目が消えない",
      "422と404をテストした",
      "更新後の値を返している",
    ],
    searchKeywords: [
      "Laravel update validation sometimes",
      "Laravel PATCH resource controller",
    ],
  },
  {
    id: "laravel-destroy",
    technology: "laravel",
    action: "destroy",
    title: "削除API",
    summary: "対象と権限を確認してレコードを削除する。",
    useWhen: "不要になったデータをユーザー操作で削除したいとき。",
    mentalModel: "対象取得 → 権限確認 → 削除方法を選ぶ → delete → 結果を返す",
    flow: [
      "DELETE /resources/{id}を受け取る",
      "Route Model Bindingで対象を取得する",
      "削除権限を確認する",
      "物理削除または論理削除を行う",
      "200または204を返す",
    ],
    buildingBlocks: [
      "Route::delete",
      "Policy",
      "delete",
      "SoftDeletes",
      "DB外ファイルの後片付け",
    ],
    branches: [
      { condition: "対象なし", result: "404を返す" },
      { condition: "権限なし", result: "403を返す" },
      { condition: "関連データあり", result: "制約・連鎖削除・削除禁止を判断する" },
    ],
    questions: [
      "本当に物理削除でよいか？",
      "元に戻す必要はあるか？",
      "関連レコードや画像はどうするか？",
      "削除前に業務上の制約があるか？",
    ],
    codeLabel: "物理削除の最小例",
    code: `public function destroy(LearningLog $learningLog): JsonResponse
{
    $learningLog->delete();

    return response()->json([
        'message' => '削除しました。',
    ], 200);
}`,
    checklist: [
      "対象だけ削除される",
      "他のデータが残る",
      "存在しないIDで404になる",
      "削除方法を要件から選んだ",
    ],
    searchKeywords: [
      "Laravel soft deletes",
      "Laravel database cascade delete",
    ],
  },
  {
    id: "laravel-transaction",
    technology: "laravel",
    action: "transaction",
    title: "複数テーブルの一括処理",
    summary: "複数の保存を、全部成功または全部失敗にそろえる。",
    useWhen: "注文と明細など、途中まで保存されると困る処理。",
    mentalModel: "事前検証 → transaction開始 → 複数処理 → commit／例外ならrollback",
    flow: [
      "入力と権限を事前に検証する",
      "DB::transaction()を開始する",
      "親レコードを保存する",
      "関連レコードを保存する",
      "すべて成功したら確定し、例外時は自動で戻す",
    ],
    buildingBlocks: [
      "DB::transaction",
      "例外",
      "リレーション",
      "外部APIとの境界",
    ],
    branches: [
      { condition: "DB処理がすべて成功", result: "commitされる" },
      { condition: "途中で例外", result: "DB変更がrollbackされる" },
      { condition: "外部APIもある", result: "DBだけでは元に戻せない点を設計する" },
    ],
    questions: [
      "途中まで成功すると何が壊れるか？",
      "トランザクションに含めるDB処理はどれか？",
      "外部APIやメール送信はどこで行うか？",
    ],
    codeLabel: "トランザクションの最小例",
    code: `$order = DB::transaction(function () use ($validated) {
    $order = Order::create($validated['order']);
    $order->items()->createMany($validated['items']);

    return $order;
});`,
    checklist: [
      "途中の失敗で全変更が戻る",
      "トランザクションを長時間保持しない",
      "外部処理を同じ感覚で扱っていない",
    ],
    searchKeywords: [
      "Laravel database transactions",
      "Laravel after commit event",
    ],
  },
  {
    id: "next-list-page",
    technology: "nextjs",
    action: "一覧画面",
    title: "API一覧画面",
    summary: "APIから複数件取得し、状態ごとに表示を切り替える。",
    useWhen: "商品、投稿、履歴などの一覧ページを作るとき。",
    mentalModel: "画面表示 → GET → loading / error / empty / data → map",
    flow: [
      "page.tsxを表示する",
      "取得中を表示する",
      "GETリクエストを送る",
      "JSONを配列stateへ保存する",
      "0件またはmapによる一覧を表示する",
    ],
    buildingBlocks: [
      "page.tsx",
      "Client ComponentまたはServer Component",
      "fetch",
      "loading / error / data",
      "map",
      "Link",
    ],
    branches: [
      { condition: "取得中", result: "ローディング表示" },
      { condition: "通信失敗", result: "エラーと再試行を表示" },
      { condition: "0件", result: "空状態と登録導線を表示" },
      { condition: "1件以上", result: "mapで一覧表示" },
    ],
    questions: [
      "サーバーとブラウザのどちらで取得するか？",
      "0件の次の行動は何か？",
      "一覧から詳細へどう移動するか？",
      "再取得のきっかけは何か？",
    ],
    codeLabel: "表示条件の骨組み",
    code: `{isLoading && <p>読み込み中...</p>}
{!isLoading && error && <ErrorView />}
{!isLoading && !error && items.length === 0 && <EmptyView />}
{!isLoading && !error && items.length > 0 && (
  <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
)}`,
    checklist: [
      "4つの状態を表示できる",
      "keyに安定したIDを使う",
      "詳細や登録への導線がある",
      "長い一覧の扱いを考えた",
    ],
    searchKeywords: [
      "Next.js data fetching client component",
      "React render list key",
    ],
  },
  {
    id: "next-detail-page",
    technology: "nextjs",
    action: "詳細画面",
    title: "動的ルートの詳細画面",
    summary: "URLのIDを使ってAPIから1件取得する。",
    useWhen: "/items/123のように、レコードごとのページを作るとき。",
    mentalModel: "URLのID → GET /{id} → loading / 404 / error / data",
    flow: [
      "[id]/page.tsxを作る",
      "paramsからidを受け取る",
      "GET /resources/{id}を送る",
      "404とその他の失敗を分ける",
      "取得データを詳細表示する",
    ],
    buildingBlocks: [
      "app/resources/[id]/page.tsx",
      "paramsまたはuseParams",
      "fetch",
      "notFound",
      "Link",
    ],
    branches: [
      { condition: "取得中", result: "読み込み表示" },
      { condition: "404", result: "見つからない表示" },
      { condition: "その他の失敗", result: "再試行可能なエラー表示" },
      { condition: "成功", result: "1件の詳細表示" },
    ],
    questions: [
      "idは文字列か数値か？",
      "404と通信失敗を区別できているか？",
      "編集・削除・一覧への導線は必要か？",
    ],
    codeLabel: "動的ルートの取得先",
    code: `const params = useParams<{ id: string }>();

const response = await fetch(
  \`\${process.env.NEXT_PUBLIC_API_BASE_URL}/items/\${params.id}\`,
);`,
    checklist: [
      "正しいIDをURLへ入れる",
      "不正IDで404表示になる",
      "戻る導線がある",
      "任意項目のnull表示を決めた",
    ],
    searchKeywords: [
      "Next.js dynamic routes app router",
      "Next.js useParams TypeScript",
    ],
  },
  {
    id: "next-create-page",
    technology: "nextjs",
    action: "登録画面",
    title: "登録フォーム画面",
    summary: "入力をstateで管理し、POST成功後に詳細へ遷移する。",
    useWhen: "ユーザーが新しいデータを作成する画面。",
    mentalModel: "form state → submit → POST → 422 / error / success → 詳細へ",
    flow: [
      "入力値をformDataで管理する",
      "submit時にページ再読み込みを止める",
      "POSTとJSON bodyを送る",
      "422なら項目別エラーを保存する",
      "成功データのIDで詳細画面へ遷移する",
    ],
    buildingBlocks: [
      "useState",
      "onChange / onSubmit",
      "fetch method POST",
      "fieldErrors",
      "isSubmitting",
      "useRouter",
    ],
    branches: [
      { condition: "422", result: "入力欄ごとのエラー表示" },
      { condition: "その他の失敗", result: "フォーム全体のエラー表示" },
      { condition: "成功", result: "作成されたIDの詳細へ遷移" },
    ],
    questions: [
      "入力項目とAPIのキーは一致しているか？",
      "二重送信を防いでいるか？",
      "任意項目は空文字かnullか？",
      "登録後はどこへ移動するか？",
    ],
    codeLabel: "POST設定の最小例",
    code: `const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

if (response.status === 422) {
  const result = await response.json();
  setFieldErrors(result.errors);
  return;
}`,
    checklist: [
      "必須不足で各項目にエラーが出る",
      "送信中はボタンを無効化する",
      "成功時に作成データへ移動する",
      "通信失敗時も再送できる",
    ],
    searchKeywords: [
      "Next.js useRouter push form submit",
      "fetch POST JSON JavaScript",
    ],
  },
  {
    id: "next-edit-page",
    technology: "nextjs",
    action: "編集画面",
    title: "編集フォーム画面",
    summary: "既存データを初期値として読み込み、PATCHで更新する。",
    useWhen: "登録済みデータをユーザーが変更するとき。",
    mentalModel: "ID → GET → form初期値 → 入力変更 → PATCH → 詳細へ",
    flow: [
      "URLのIDから既存データを取得する",
      "nullを空文字へ変換してformDataへ入れる",
      "ユーザーの入力でformDataを更新する",
      "PATCHを送る",
      "422または成功後の遷移を処理する",
    ],
    buildingBlocks: [
      "[id]/edit/page.tsx",
      "取得用loading/error",
      "formData",
      "PATCH",
      "共通フォーム",
    ],
    branches: [
      { condition: "取得404", result: "編集対象なしを表示" },
      { condition: "更新422", result: "項目別エラーを表示" },
      { condition: "更新成功", result: "詳細画面へ戻る" },
    ],
    questions: [
      "登録画面とフォームを共有できるか？",
      "取得失敗と送信失敗を分けたか？",
      "APIのnullをinputへ直接渡していないか？",
      "未変更項目を維持できるか？",
    ],
    codeLabel: "APIデータからフォームへの変換",
    code: `setFormData({
  goal: result.data.goal,
  learnings: result.data.learnings ?? "",
});

await fetch(\`/api/items/\${id}\`, {
  method: "PATCH",
  body: JSON.stringify(formData),
});`,
    checklist: [
      "既存値が初期表示される",
      "任意項目のnullを扱える",
      "登録画面と入力UIを共有した",
      "更新後の内容が詳細に反映される",
    ],
    searchKeywords: [
      "React form initial data fetch",
      "Next.js edit page dynamic route",
    ],
  },
  {
    id: "next-delete-action",
    technology: "nextjs",
    action: "削除操作",
    title: "削除と一覧への遷移",
    summary: "確認後にDELETEを送り、成功したら一覧へ戻る。",
    useWhen: "詳細画面などからデータを削除するとき。",
    mentalModel: "削除クリック → 確認 → DELETE → error / success → 一覧へ",
    flow: [
      "削除ボタンを押す",
      "取り消せないことを確認する",
      "DELETEを送る",
      "失敗時は詳細画面に残してエラーを表示する",
      "成功時は一覧へ遷移して再取得する",
    ],
    buildingBlocks: [
      "button",
      "window.confirmまたはModal",
      "DELETE",
      "isDeleting",
      "router.push / refresh",
    ],
    branches: [
      { condition: "ユーザーがキャンセル", result: "何もしない" },
      { condition: "削除失敗", result: "画面に残りエラー表示" },
      { condition: "削除成功", result: "一覧へ移動" },
    ],
    questions: [
      "削除は元に戻せるか？",
      "確認文で対象が分かるか？",
      "連打を防いでいるか？",
      "一覧の古いキャッシュを更新できるか？",
    ],
    codeLabel: "DELETEの最小例",
    code: `if (!window.confirm("削除しますか？")) return;

const response = await fetch(\`/api/items/\${id}\`, {
  method: "DELETE",
});

if (!response.ok) throw new Error();
router.push("/items");`,
    checklist: [
      "キャンセル時に削除されない",
      "削除中はボタンを無効化する",
      "失敗時に再試行できる",
      "成功後の一覧から消える",
    ],
    searchKeywords: [
      "Next.js router refresh after delete",
      "React delete confirmation modal",
    ],
  },
  {
    id: "react-async-data",
    technology: "react",
    action: "非同期取得",
    title: "loading / error / data",
    summary: "通信中・失敗・成功を別のstateとして管理する。",
    useWhen: "画面表示後にAPIなど外部データを取得するとき。",
    mentalModel: "開始時loading → 成功ならdata → 失敗ならerror → 最後にloading終了",
    flow: [
      "取得開始状態にする",
      "前回のエラーを消す",
      "非同期処理を実行する",
      "成功データまたはエラーをstateへ保存する",
      "finally相当で取得中を終了する",
    ],
    buildingBlocks: [
      "useState",
      "useEffect",
      "Promise / async",
      "キャンセル処理",
      "条件レンダリング",
    ],
    branches: [
      { condition: "通信中", result: "loadingを表示" },
      { condition: "失敗", result: "errorを表示" },
      { condition: "成功", result: "dataを表示" },
    ],
    questions: [
      "取得のきっかけは何か？",
      "コンポーネント破棄後の更新を防ぐ必要があるか？",
      "再試行をどう起こすか？",
    ],
    codeLabel: "非同期状態の最小構成",
    code: `const [data, setData] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);`,
    checklist: [
      "初期状態を説明できる",
      "成功・失敗の両方でloadingが終わる",
      "古いリクエストの結果を考えた",
      "再試行できる",
    ],
    searchKeywords: [
      "React useEffect fetch cleanup",
      "React async state loading error",
    ],
  },
  {
    id: "react-controlled-form",
    technology: "react",
    action: "フォーム",
    title: "Controlled Component",
    summary: "入力値をReactのstateと同期させる。",
    useWhen: "送信前の入力値、エラー、ボタン状態をReactで管理したいとき。",
    mentalModel: "valueはstate → onChangeでstate更新 → 再レンダリングで入力欄へ反映",
    flow: [
      "入力項目の初期値をstateに用意する",
      "inputのvalueへstateを渡す",
      "onChangeで新しい値を受け取る",
      "setStateで対象項目を更新する",
      "submit時にstateを利用する",
    ],
    buildingBlocks: [
      "useState",
      "value",
      "onChange",
      "name",
      "formData",
    ],
    branches: [
      { condition: "入力変更", result: "該当stateを更新する" },
      { condition: "項目エラーあり", result: "入力欄の近くに表示する" },
      { condition: "送信中", result: "編集・再送を制御する" },
    ],
    questions: [
      "入力値の型は何か？",
      "空欄は空文字かnullか？",
      "項目ごとにstateを分けるかformDataにまとめるか？",
    ],
    codeLabel: "共通change処理",
    code: `const [formData, setFormData] = useState({
  title: "",
  body: "",
});

const handleChange = (name: keyof FormData, value: string) => {
  setFormData((current) => ({ ...current, [name]: value }));
};`,
    checklist: [
      "valueとonChangeが対になっている",
      "stateを直接書き換えていない",
      "inputへnullを渡していない",
      "項目名のタイプミスを型で防いだ",
    ],
    searchKeywords: [
      "React controlled components form",
      "React update object state",
    ],
  },
  {
    id: "react-derived-list",
    technology: "react",
    action: "検索・絞り込み",
    title: "stateから表示用データを計算",
    summary: "元データを壊さず、検索語などから表示配列を作る。",
    useWhen: "一覧をキーワード、状態、カテゴリで絞り込みたいとき。",
    mentalModel: "元データ + 条件state → filter / sort → 表示用データ",
    flow: [
      "元データをstateに保持する",
      "検索語や選択条件をstateに保持する",
      "filterやsortで表示用データを計算する",
      "計算結果をmapで表示する",
    ],
    buildingBlocks: [
      "useState",
      "filter",
      "sort",
      "useMemoは重い計算のときだけ",
      "派生stateを増やしすぎない",
    ],
    branches: [
      { condition: "検索語が空", result: "全件を表示する" },
      { condition: "一致なし", result: "検索結果0件を表示する" },
      { condition: "条件あり", result: "一致する項目だけ表示する" },
    ],
    questions: [
      "絞り込みはブラウザ側かAPI側か？",
      "大文字小文字やひらがなをどう扱うか？",
      "sortで元配列を直接変更していないか？",
    ],
    codeLabel: "表示用配列の計算",
    code: `const visibleItems = items.filter((item) =>
  item.name.toLowerCase().includes(keyword.toLowerCase()),
);`,
    checklist: [
      "元データを変更していない",
      "0件表示がある",
      "件数が多い場合はAPI検索を検討した",
      "不要なuseEffectを使っていない",
    ],
    searchKeywords: [
      "React filter list state",
      "React you might not need an effect derived state",
    ],
  },
  {
    id: "react-reusable-component",
    technology: "react",
    action: "共通化",
    title: "propsによる共通コンポーネント",
    summary: "同じ見た目や役割を、値と処理だけ変えて再利用する。",
    useWhen: "登録・編集フォームや複数画面のカードが重複しているとき。",
    mentalModel: "共通部分を部品へ → 違う値と処理はprops → 親がstateを管理",
    flow: [
      "重複しているUIを見つける",
      "共通部分と画面固有部分を分ける",
      "異なる値・文言・処理をpropsにする",
      "親からpropsを渡して利用する",
    ],
    buildingBlocks: [
      "props type",
      "children",
      "イベントコールバック",
      "責務の分離",
    ],
    branches: [
      { condition: "見た目だけ共通", result: "childrenやclassNameで調整する" },
      { condition: "処理が異なる", result: "onSubmitなどをpropsで渡す" },
      { condition: "1回しか使わない", result: "急いで共通化しない" },
    ],
    questions: [
      "本当に同じ役割か、たまたま似ているだけか？",
      "propsが多すぎて分かりにくくならないか？",
      "stateは親と子のどちらが持つべきか？",
    ],
    codeLabel: "イベントをpropsで渡す例",
    code: `type FormProps = {
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ItemForm({ submitLabel, onSubmit }: FormProps) {
  return <form onSubmit={onSubmit}>...</form>;
}`,
    checklist: [
      "共通化前に2か所以上の重複がある",
      "コンポーネント名が役割を表す",
      "親子の責任を説明できる",
      "登録・編集の変更が一か所で済む",
    ],
    searchKeywords: [
      "React passing props event handler",
      "React component composition",
    ],
  },
  {
    id: "react-modal",
    technology: "react",
    action: "モーダル",
    title: "開閉状態を持つモーダル",
    summary: "開閉stateと選択対象を管理し、画面上に重ねて表示する。",
    useWhen: "確認、補足情報、簡単な編集を現在画面の上に表示するとき。",
    mentalModel: "開く操作 → 対象とisOpenを保存 → 表示 → 閉じる操作でリセット",
    flow: [
      "開閉状態をstateに用意する",
      "必要なら選択対象もstateに入れる",
      "開くボタンでstateを更新する",
      "isOpenのときだけモーダルを表示する",
      "閉じる・Esc・背景クリックを処理する",
    ],
    buildingBlocks: [
      "isOpen",
      "selectedItem",
      "条件レンダリング",
      "dialog",
      "フォーカス管理",
    ],
    branches: [
      { condition: "閉じている", result: "DOMへ表示しない" },
      { condition: "開いている", result: "背景とdialogを表示する" },
      { condition: "保存成功", result: "閉じて必要なら再取得する" },
    ],
    questions: [
      "別ページのほうが適切ではないか？",
      "キーボードだけで操作できるか？",
      "背景スクロールやフォーカスをどうするか？",
    ],
    codeLabel: "開閉の最小構成",
    code: `const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>開く</button>
{isOpen && (
  <dialog open>
    <button onClick={() => setIsOpen(false)}>閉じる</button>
  </dialog>
)}`,
    checklist: [
      "閉じる方法が分かる",
      "Escやフォーカスを考えた",
      "重要な画面遷移をモーダルに詰め込んでいない",
      "選択対象を閉じるときにリセットする",
    ],
    searchKeywords: [
      "React accessible modal dialog",
      "HTML dialog element React",
    ],
  },
  {
    id: "typescript-domain-type",
    technology: "typescript",
    action: "データ型",
    title: "1件のデータ型と配列",
    summary: "APIから受け取る1件の形を型にし、一覧はその配列で表す。",
    useWhen: "APIデータやアプリ内の主要なデータ構造を扱うとき。",
    mentalModel: "1件 = Item、複数件 = Item[]、未取得 = Item | null",
    flow: [
      "APIレスポンスのJSONを確認する",
      "1件の型を単数形で定義する",
      "一覧stateは型の配列にする",
      "詳細stateは型またはnullにする",
    ],
    buildingBlocks: [
      "type / interface",
      "配列 []",
      "union |",
      "null",
    ],
    branches: [
      { condition: "一覧", result: "Item[]" },
      { condition: "詳細の初期状態", result: "Item | null" },
      { condition: "必ず存在する値", result: "optionalにしない" },
    ],
    questions: [
      "1件と複数件を区別できているか？",
      "日付はJSONでは文字列ではないか？",
      "APIに必ず含まれるキーはどれか？",
    ],
    codeLabel: "1件・一覧・詳細の型",
    code: `type Item = {
  id: number;
  name: string;
  note: string | null;
};

const [items, setItems] = useState<Item[]>([]);
const [item, setItem] = useState<Item | null>(null);`,
    checklist: [
      "型名が単数形になっている",
      "APIの実際のJSONと一致する",
      "anyを使って逃げていない",
      "一覧と詳細の初期値が正しい",
    ],
    searchKeywords: [
      "TypeScript object type array",
      "TypeScript union null",
    ],
  },
  {
    id: "typescript-api-response",
    technology: "typescript",
    action: "APIレスポンス",
    title: "成功・一覧・バリデーションの型",
    summary: "HTTPレスポンスの用途ごとにJSONの形を定義する。",
    useWhen: "fetch後のresult.dataやresult.errorsを安全に扱いたいとき。",
    mentalModel: "HTTP状態ごとに返るJSONの形が違う → 用途別の型を用意",
    flow: [
      "Laravelが返すJSONを確認する",
      "成功レスポンスの型を作る",
      "一覧ならdataを配列にする",
      "422ならerrorsの型を作る",
      "status確認後に対応する型としてJSONを読む",
    ],
    buildingBlocks: [
      "Response",
      "response.status",
      "response.json",
      "Response type",
      "ValidationError type",
    ],
    branches: [
      { condition: "200 / 201", result: "成功レスポンス型" },
      { condition: "422", result: "バリデーションエラー型" },
      { condition: "404", result: "見つからない処理" },
      { condition: "その他", result: "一般エラー処理" },
    ],
    questions: [
      "status確認前に成功型として扱っていないか？",
      "dataは1件か配列か？",
      "Laravelのerrorsは文字列か文字列配列か？",
    ],
    codeLabel: "用途別レスポンス型",
    code: `type ItemResponse = {
  message: string;
  data: Item;
};

type ValidationErrorResponse = {
  message: string;
  errors: Partial<Record<keyof FormData, string[]>>;
};`,
    checklist: [
      "LaravelのJSON構造と一致する",
      "statusごとに処理を分ける",
      "Axiosとfetchの書き方を混同していない",
      "response.json()を呼んでいる",
    ],
    searchKeywords: [
      "TypeScript fetch response type",
      "Laravel validation error response JSON",
    ],
  },
  {
    id: "typescript-null-optional",
    technology: "typescript",
    action: "null / optional",
    title: "nullableとoptionalの使い分け",
    summary: "キーがない状態と、値がnullの状態を区別する。",
    useWhen: "任意入力、APIレスポンス、部分更新の型を設計するとき。",
    mentalModel: "property?: 型 = キーがないかも、型 | null = キーはあるが値が空かも",
    flow: [
      "APIにキーが常に存在するか確認する",
      "キーが省略されるなら?を使う",
      "値がnullになるならunionを使う",
      "フォームinputへ渡す前に空文字へ変換する",
    ],
    buildingBlocks: [
      "optional property ?",
      "union | null",
      "nullish coalescing ??",
      "optional chaining ?.",
    ],
    branches: [
      { condition: "キー自体がない可能性", result: "note?: string" },
      { condition: "キーはあり値が空", result: "note: string | null" },
      { condition: "inputのvalue", result: "note ?? \"\"へ変換" },
    ],
    questions: [
      "APIはキーを省略するか？",
      "DBのnullable値はどう返るか？",
      "空文字とnullを同じ意味で扱うか？",
    ],
    codeLabel: "違いの最小例",
    code: `type ApiItem = {
  note: string | null;
};

type PatchItem = {
  note?: string | null;
};

const inputValue = apiItem.note ?? "";`,
    checklist: [
      "?とnullの意味を説明できる",
      "inputへnullを渡さない",
      "API契約に合わせて型を決めた",
      "必要以上にすべてoptionalにしていない",
    ],
    searchKeywords: [
      "TypeScript optional vs null",
      "TypeScript nullish coalescing",
    ],
  },
  {
    id: "typescript-keyof-form",
    technology: "typescript",
    action: "フォーム更新",
    title: "keyofによる安全な項目更新",
    summary: "フォームに存在する項目名だけを更新できるようにする。",
    useWhen: "複数入力欄を1つの共通change処理で更新したいとき。",
    mentalModel: "keyof FormData = 使用可能な項目名のunion",
    flow: [
      "フォームデータ型を定義する",
      "nameをkeyof FormDataとして受け取る",
      "computed propertyで該当項目を更新する",
      "同じキーの項目エラーも消す",
    ],
    buildingBlocks: [
      "keyof",
      "computed property [name]",
      "Partial",
      "Record",
    ],
    branches: [
      { condition: "正しい項目名", result: "更新できる" },
      { condition: "存在しない項目名", result: "TypeScriptがエラーにする" },
      { condition: "項目エラーあり", result: "そのキーだけ削除する" },
    ],
    questions: [
      "name属性と型のキーが一致しているか？",
      "Record<string, string>でタイプミスを許していないか？",
      "stateを直接変更していないか？",
    ],
    codeLabel: "型安全なchange処理",
    code: `type FormData = {
  title: string;
  body: string;
};

const handleChange = (name: keyof FormData, value: string) => {
  setFormData((current) => ({
    ...current,
    [name]: value,
  }));
};`,
    checklist: [
      "項目名のタイプミスを検出できる",
      "既存項目をスプレッドで維持する",
      "フィールドエラー型にもkeyofを使える",
    ],
    searchKeywords: [
      "TypeScript keyof form state",
      "TypeScript computed property name",
    ],
  },
  {
    id: "typescript-state-union",
    technology: "typescript",
    action: "状態設計",
    title: "状態をunionで表す",
    summary: "同時に起こらない状態を、1つの型で安全に表す。",
    useWhen: "loading、success、errorの組み合わせ矛盾を減らしたいとき。",
    mentalModel: "状態ごとに必要なデータをセットにし、statusで絞り込む",
    flow: [
      "画面が取り得る状態を列挙する",
      "各状態に必要な値を定義する",
      "statusを共通の判別キーにする",
      "statusで分岐して表示する",
    ],
    buildingBlocks: [
      "union type",
      "literal type",
      "discriminated union",
      "narrowing",
    ],
    branches: [
      { condition: "idle / loading", result: "dataを持たない" },
      { condition: "success", result: "dataを必須で持つ" },
      { condition: "error", result: "messageを必須で持つ" },
    ],
    questions: [
      "isLoading=trueかつdataありなどの矛盾が起きるか？",
      "状態ごとに必須となる値は何か？",
      "単純な画面に対して複雑すぎないか？",
    ],
    codeLabel: "判別可能なunion",
    code: `type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

if (state.status === "success") {
  return <List items={state.data} />;
}`,
    checklist: [
      "矛盾したstateを作れない",
      "status分岐で必要な値へアクセスできる",
      "小規模画面では単純なstateも検討した",
    ],
    searchKeywords: [
      "TypeScript discriminated unions",
      "TypeScript narrowing literal type",
    ],
  },
  {
    id: "typescript-unknown-error",
    technology: "typescript",
    action: "エラー処理",
    title: "unknownを安全に絞り込む",
    summary: "catchした値を、確認してからErrorとして扱う。",
    useWhen: "例外のmessageなどを安全に表示・記録したいとき。",
    mentalModel: "catch値は何でもあり得る → instanceof等で確認 → 使用する",
    flow: [
      "catchでunknownとして受け取る",
      "Errorかどうか判定する",
      "Errorならmessageを使う",
      "それ以外は共通メッセージへ変換する",
    ],
    buildingBlocks: [
      "unknown",
      "instanceof",
      "type guard",
      "安全なフォールバック",
    ],
    branches: [
      { condition: "Errorインスタンス", result: "error.messageを利用できる" },
      { condition: "文字列など", result: "共通メッセージを使う" },
      { condition: "ユーザー向け表示", result: "内部情報をそのまま出さない" },
    ],
    questions: [
      "外部へ見せてよいエラー内容か？",
      "開発者向けログと利用者向け文言を分けたか？",
      "anyで型チェックを無効にしていないか？",
    ],
    codeLabel: "catch値の絞り込み",
    code: `try {
  await saveItem();
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown error";

  console.error(message);
}`,
    checklist: [
      "catch値を無条件にError扱いしない",
      "利用者へ機密情報を表示しない",
      "原因調査用の情報をログへ残す",
    ],
    searchKeywords: [
      "TypeScript catch unknown error",
      "TypeScript custom type guard",
    ],
  },
];
