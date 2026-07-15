"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { generateDesign } from "@/features/design-trainer/generator";
import {
  actionDefinitions,
  defaultsForAction,
  initialDesign,
} from "@/features/design-trainer/templates";
import { DesignState } from "@/features/design-trainer/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {hint && <span className="ml-2 text-xs text-slate-400">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200">
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

function Summary({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-bold tracking-wider text-indigo-600">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-6 text-slate-700"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CodeDetails({ title, code }: { title: string; code: string }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-slate-100">
        <span>{title}</span>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 group-open:hidden">
          コード例を見る
        </span>
        <span className="hidden text-xs text-slate-400 group-open:inline">
          閉じる
        </span>
      </summary>
      <pre className="overflow-x-auto border-t border-slate-800 p-5 text-[13px] leading-6 text-emerald-300">
        <code>{code}</code>
      </pre>
    </details>
  );
}

export default function DesignTrainerPage() {
  const [design, setDesign] = useState<DesignState>(initialDesign);
  const generated = useMemo(() => generateDesign(design), [design]);
  const selected = actionDefinitions.find(
    (item) => item.action === design.action,
  )!;
  const needsBody = design.action === "store" || design.action === "update";
  const needsTarget = ["show", "update", "destroy"].includes(design.action);

  function update<K extends keyof DesignState>(key: K, value: DesignState[K]) {
    setDesign((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              L
            </span>
            Learning Log
          </Link>
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            実装設計トレーニング
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-indigo-600">
            DESIGN BEFORE CODE
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            やりたいことを、実装できる手順に変える。
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            設計項目を選ぶと、日本語の処理手順とLaravelコード、よくあるテスト観点を組み立てます。コード例は必要になるまで閉じておけます。
          </p>
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
          <div className="space-y-6">
            <Section
              number="1"
              title="メソッドを選ぶ"
              description="実現したい操作に近いCRUDメソッドを選びます。"
            >
              <div className="grid gap-3 sm:grid-cols-5">
                {actionDefinitions.map((action) => {
                  const active = action.action === design.action;
                  return (
                    <button
                      key={action.action}
                      type="button"
                      onClick={() =>
                        setDesign((current) =>
                          defaultsForAction(action.action, current),
                        )
                      }
                      className={`rounded-2xl border p-3 text-left transition ${active ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"}`}
                    >
                      <span
                        className={`text-[10px] font-black ${active ? "text-indigo-200" : "text-slate-400"}`}
                      >
                        {action.httpMethod}
                      </span>
                      <span className="mt-1 block text-sm font-black">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
                <p className="text-sm font-bold text-indigo-950">
                  {selected.summary}
                </p>
                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  {selected.learningPoint}
                </p>
              </div>
            </Section>

            <Section
              number="2"
              title="対象と入口を決める"
              description="Controller・Model・URLの対応を明確にします。"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Model名" hint="PHPクラス名">
                  <input
                    className={inputClass}
                    value={design.modelName}
                    onChange={(e) => update("modelName", e.target.value)}
                  />
                </Field>
                <Field label="日本語での呼び名">
                  <input
                    className={inputClass}
                    value={design.resourceLabel}
                    onChange={(e) => update("resourceLabel", e.target.value)}
                  />
                </Field>
                <Field label="Controller名">
                  <input
                    className={inputClass}
                    value={design.controllerName}
                    onChange={(e) => update("controllerName", e.target.value)}
                  />
                </Field>
                <Field label="routes/api.phpのパス" hint="/apiは不要">
                  <input
                    className={inputClass}
                    value={design.routePath}
                    onChange={(e) => update("routePath", e.target.value)}
                  />
                </Field>
                <Field label="1件用の変数名" hint="$は不要">
                  <input
                    className={inputClass}
                    value={design.singularVariable}
                    onChange={(e) => update("singularVariable", e.target.value)}
                  />
                </Field>
                <Field label="複数件用の変数名" hint="$は不要">
                  <input
                    className={inputClass}
                    value={design.pluralVariable}
                    onChange={(e) => update("pluralVariable", e.target.value)}
                  />
                </Field>
                {needsTarget && (
                  <Field label="URLパラメータ名">
                    <input
                      className={inputClass}
                      value={design.routeParameter}
                      onChange={(e) => update("routeParameter", e.target.value)}
                    />
                  </Field>
                )}
                {needsTarget && (
                  <Field label="対象の取得方法">
                    <select
                      className={inputClass}
                      value={design.lookupMode}
                      onChange={(e) =>
                        setDesign((current) => ({
                          ...current,
                          lookupMode: e.target
                            .value as DesignState["lookupMode"],
                          routeParameter:
                            e.target.value === "binding"
                              ? current.singularVariable
                              : "id",
                        }))
                      }
                    >
                      <option value="binding">
                        ルートモデルバインディング
                      </option>
                      <option value="find-or-fail">findOrFailで取得</option>
                    </select>
                  </Field>
                )}
              </div>
            </Section>

            <Section
              number="3"
              title="リクエストを設計する"
              description="入力、認証、操作できる人の範囲を決めます。"
            >
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      リクエストボディ
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {needsBody
                        ? "登録・更新する値をJSONで受け取ります。"
                        : "このメソッドでは通常使用しません。"}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${needsBody ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}
                  >
                    {needsBody ? "必要" : "不要"}
                  </span>
                </div>
                {needsBody && (
                  <div className="grid gap-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:grid-cols-2">
                    <Field label="FormRequest名">
                      <input
                        className={inputClass}
                        value={design.requestClass}
                        onChange={(e) => update("requestClass", e.target.value)}
                      />
                    </Field>
                    <Field label="入力項目" hint="カンマ区切り">
                      <input
                        className={inputClass}
                        value={design.inputFields}
                        onChange={(e) => update("inputFields", e.target.value)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="バリデーションルール"
                        hint="1行に field: rules"
                      >
                        <textarea
                          className={`${inputClass} min-h-36 resize-y font-mono`}
                          value={design.validationRules}
                          onChange={(e) =>
                            update("validationRules", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                    {design.action === "update" && (
                      <Field label="HTTPメソッド">
                        <select
                          className={inputClass}
                          value={design.updateMethod}
                          onChange={(e) =>
                            update(
                              "updateMethod",
                              e.target.value as DesignState["updateMethod"],
                            )
                          }
                        >
                          <option value="patch">PATCH（部分更新）</option>
                          <option value="put">PUT（全体置換）</option>
                        </select>
                      </Field>
                    )}
                    <Toggle
                      checked={design.transaction}
                      onChange={(value) => update("transaction", value)}
                      label="トランザクション"
                      description="複数のDB操作を一括で成功・失敗させます。"
                    />
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Toggle
                    checked={design.authentication}
                    onChange={(value) =>
                      setDesign((current) => ({
                        ...current,
                        authentication: value,
                        ownership: value ? current.ownership : false,
                      }))
                    }
                    label="ログイン必須"
                    description="auth:sanctumをルートへ追加します。"
                  />
                  <Toggle
                    checked={design.ownership}
                    onChange={(value) =>
                      setDesign((current) => ({
                        ...current,
                        ownership: value,
                        authentication: value ? true : current.authentication,
                      }))
                    }
                    label="所有者確認"
                    description="自分のデータだけ操作できるようにします。"
                  />
                </div>
              </div>
            </Section>

            <Section
              number="4"
              title="DB操作を設計する"
              description="取得・検索・更新・削除の条件を具体化します。"
            >
              {design.action === "index" && (
                <div className="space-y-5">
                  <Toggle
                    checked={design.searchEnabled}
                    onChange={(value) => update("searchEnabled", value)}
                    label="検索・絞り込みを使用する"
                    description="クエリパラメータがある場合だけwhere条件を加えます。"
                  />
                  {design.searchEnabled && (
                    <div className="grid gap-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:grid-cols-2">
                      <Field label="クエリパラメータ">
                        <input
                          className={inputClass}
                          value={design.searchParameter}
                          onChange={(e) =>
                            update("searchParameter", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="検索対象カラム" hint="カンマ区切り">
                        <input
                          className={inputClass}
                          value={design.searchColumns}
                          onChange={(e) =>
                            update("searchColumns", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="一致方法">
                        <select
                          className={inputClass}
                          value={design.searchMode}
                          onChange={(e) =>
                            update(
                              "searchMode",
                              e.target.value as DesignState["searchMode"],
                            )
                          }
                        >
                          <option value="partial">部分一致（LIKE）</option>
                          <option value="exact">完全一致</option>
                        </select>
                      </Field>
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="並び替えるカラム">
                      <input
                        className={inputClass}
                        value={design.sortField}
                        onChange={(e) => update("sortField", e.target.value)}
                      />
                    </Field>
                    <Field label="並び順">
                      <select
                        className={inputClass}
                        value={design.sortDirection}
                        onChange={(e) =>
                          update(
                            "sortDirection",
                            e.target.value as DesignState["sortDirection"],
                          )
                        }
                      >
                        <option value="desc">降順（新しい・大きい順）</option>
                        <option value="asc">昇順（古い・小さい順）</option>
                      </select>
                    </Field>
                  </div>
                  <Toggle
                    checked={design.secondarySortEnabled}
                    onChange={(value) => update("secondarySortEnabled", value)}
                    label="第2の並び順"
                    description="第1条件が同じ値だった場合の順番を安定させます。"
                  />
                  {design.secondarySortEnabled && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="第2のカラム">
                        <input
                          className={inputClass}
                          value={design.secondarySortField}
                          onChange={(e) =>
                            update("secondarySortField", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="第2の並び順">
                        <select
                          className={inputClass}
                          value={design.secondarySortDirection}
                          onChange={(e) =>
                            update(
                              "secondarySortDirection",
                              e.target
                                .value as DesignState["secondarySortDirection"],
                            )
                          }
                        >
                          <option value="desc">降順</option>
                          <option value="asc">昇順</option>
                        </select>
                      </Field>
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="取得方法">
                      <select
                        className={inputClass}
                        value={design.fetchMode}
                        onChange={(e) =>
                          update(
                            "fetchMode",
                            e.target.value as DesignState["fetchMode"],
                          )
                        }
                      >
                        <option value="all">全件取得（get）</option>
                        <option value="paginate">ページネーション</option>
                      </select>
                    </Field>
                    {design.fetchMode === "paginate" && (
                      <Field label="1ページの件数">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className={inputClass}
                          value={design.perPage}
                          onChange={(e) =>
                            update("perPage", Number(e.target.value))
                          }
                        />
                      </Field>
                    )}
                  </div>
                </div>
              )}
              {design.action === "store" && (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                  検証済みデータだけを{" "}
                  <code className="rounded bg-white px-1.5 py-1 text-indigo-700">
                    {design.modelName}::create()
                  </code>{" "}
                  で保存します。
                </p>
              )}
              {design.action === "show" && (
                <Field
                  label="一緒に取得する関連データ"
                  hint="カンマ区切り・不要なら空欄"
                >
                  <input
                    className={inputClass}
                    value={design.eagerLoads}
                    placeholder="例: user, comments"
                    onChange={(e) => update("eagerLoads", e.target.value)}
                  />
                </Field>
              )}
              {design.action === "update" && (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                  対象を取得し、検証済みデータだけを{" "}
                  <code className="rounded bg-white px-1.5 py-1 text-indigo-700">
                    update()
                  </code>{" "}
                  へ渡します。
                </p>
              )}
              {design.action === "destroy" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="削除方法">
                    <select
                      className={inputClass}
                      value={design.deleteMode}
                      onChange={(e) =>
                        update(
                          "deleteMode",
                          e.target.value as DesignState["deleteMode"],
                        )
                      }
                    >
                      <option value="physical">物理削除</option>
                      <option value="soft">論理削除（SoftDeletes）</option>
                    </select>
                  </Field>
                  <Field label="削除後の返し方">
                    <select
                      className={inputClass}
                      value={design.deleteResponse}
                      onChange={(e) =>
                        update(
                          "deleteResponse",
                          e.target.value as DesignState["deleteResponse"],
                        )
                      }
                    >
                      <option value="message">200＋メッセージ</option>
                      <option value="no-content">204 No Content</option>
                    </select>
                  </Field>
                </div>
              )}
            </Section>

            <Section
              number="5"
              title="レスポンスを設計する"
              description="利用側が成功を判断できる形を決めます。"
            >
              {design.action === "destroy" &&
              design.deleteResponse === "no-content" ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  204 No Contentではレスポンス本文を返しません。
                </p>
              ) : (
                <Toggle
                  checked={design.responseMessage}
                  onChange={(value) => update("responseMessage", value)}
                  label="成功メッセージを含める"
                  description="dataに加えて画面表示用のmessageを返します。"
                />
              )}
            </Section>
            <button
              type="button"
              onClick={() => setDesign(initialDesign)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:text-slate-950"
            >
              入力を初期状態に戻す
            </button>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="bg-slate-950 px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-indigo-300">
                      DESIGN OUTPUT
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      {design.action} の実装設計
                    </h2>
                  </div>
                  <span className="rounded-lg bg-white/10 px-3 py-2 font-mono text-xs">
                    {design.action === "update"
                      ? design.updateMethod.toUpperCase()
                      : selected.httpMethod}
                  </span>
                </div>
              </div>
              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Summary
                    title="受け取るもの"
                    items={generated.requestSummary}
                  />
                  <Summary
                    title="DBで行うこと"
                    items={generated.databaseSummary}
                  />
                  <Summary title="返すもの" items={generated.responseSummary} />
                </div>
                <div>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-wider text-indigo-600">
                        PROCESS
                      </p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">
                        日本語の処理手順
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      {generated.flow.length} steps
                    </span>
                  </div>
                  <ol>
                    {generated.flow.map((step, index) => (
                      <li
                        key={`${index}-${step}`}
                        className="relative flex gap-4 pb-5 last:pb-0"
                      >
                        {index < generated.flow.length - 1 && (
                          <span className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-indigo-200" />
                        )}
                        <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-white text-xs font-black text-indigo-700">
                          {index + 1}
                        </span>
                        <p className="pt-1 text-sm font-medium leading-6 text-slate-700">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-black tracking-wider text-amber-700">
                    コードを見る前に
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    上の手順から、まず自分でControllerを予想してください。必要になったときだけコード例を開きます。
                  </p>
                </div>
                <div className="space-y-3">
                  <CodeDetails
                    title="Routeのコード例"
                    code={generated.routeCode}
                  />
                  {generated.requestCode && (
                    <CodeDetails
                      title="FormRequestのコード例"
                      code={generated.requestCode}
                    />
                  )}
                  <CodeDetails
                    title="Controllerのコード例"
                    code={generated.controllerCode}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-emerald-600">
                    TEST DESIGN
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    よくあるテスト観点
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {generated.tests.length} cases
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {generated.tests.map((test, index) => (
                  <details
                    key={`${test.category}-${test.title}`}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-white"
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">
                          {index + 1}
                        </span>
                        <span>
                          <span className="block text-[10px] font-black tracking-wider text-slate-400">
                            {test.category}
                          </span>
                          <span className="mt-1 block text-sm font-bold leading-5 text-slate-800">
                            {test.title}
                          </span>
                        </span>
                      </div>
                    </summary>
                    <ol className="mx-4 mb-4 space-y-2 border-t border-slate-200 pt-4">
                      {test.steps.map((step, stepIndex) => (
                        <li
                          key={step}
                          className="flex gap-3 text-xs leading-5 text-slate-600"
                        >
                          <span className="font-bold text-emerald-600">
                            {stepIndex + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </details>
                ))}
              </div>
              <div className="mt-4">
                <CodeDetails
                  title="Feature Testのコード例"
                  code={generated.testCode}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                設計時の追加チェック
              </p>
              <ul className="mt-4 space-y-3">
                {generated.considerations.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="mt-1 text-indigo-500">□</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
