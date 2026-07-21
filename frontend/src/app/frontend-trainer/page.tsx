"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { loadDesign } from "@/features/design-trainer/storage";
import { initialDesign } from "@/features/design-trainer/templates";
import { DesignState } from "@/features/design-trainer/types";
import { generateFrontendDesign } from "@/features/frontend-trainer/generator";
import {
  loadFrontendDesign,
  saveFrontendDesign,
} from "@/features/frontend-trainer/storage";
import { frontendDefaults } from "@/features/frontend-trainer/templates";
import {
  DataShape,
  FetchTiming,
  FrontendDesignState,
} from "@/features/frontend-trainer/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100";

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
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-cyan-600"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function CodeDetails({ title, code }: { title: string; code: string }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-white">
        {title}
        <span className="text-xs text-cyan-300 group-open:hidden">
          コード例を見る
        </span>
        <span className="hidden text-xs text-slate-400 group-open:inline">
          閉じる
        </span>
      </summary>
      <pre className="max-h-[560px] overflow-auto border-t border-slate-800 p-5 text-[13px] leading-6 text-emerald-300">
        <code>{code}</code>
      </pre>
    </details>
  );
}

export default function FrontendTrainerPage() {
  const [apiDesign, setApiDesign] = useState<DesignState>(initialDesign);
  const [frontend, setFrontend] = useState<FrontendDesignState>(() =>
    frontendDefaults(initialDesign),
  );
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const api = loadDesign() ?? initialDesign;
    const stored = loadFrontendDesign();
    const frame = window.requestAnimationFrame(() => {
      setApiDesign(api);
      setFrontend(
        stored?.apiDesign.action === api.action
          ? { ...frontendDefaults(api), ...stored.frontendDesign }
          : frontendDefaults(api),
      );
      setStorageReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (storageReady) saveFrontendDesign({ apiDesign, frontendDesign: frontend });
  }, [apiDesign, frontend, storageReady]);

  const generated = useMemo(
    () => generateFrontendDesign(apiDesign, frontend),
    [apiDesign, frontend],
  );

  function update<K extends keyof FrontendDesignState>(
    key: K,
    value: FrontendDesignState[K],
  ) {
    setFrontend((current) => ({ ...current, [key]: value }));
  }

  function resetFromApi() {
    const api = loadDesign() ?? initialDesign;
    setApiDesign(api);
    setFrontend(frontendDefaults(api));
  }

  return (
    <main className="min-h-screen bg-[#f4f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-black text-slate-950">
            Learning Log
          </Link>
          <nav className="flex gap-2 text-xs font-bold">
            <Link
              href="/design-trainer"
              className="rounded-full bg-indigo-50 px-3 py-2 text-indigo-700"
            >
              API設計
            </Link>
            <Link
              href="/component-map"
              className="rounded-full bg-violet-50 px-3 py-2 text-violet-700"
            >
              構成マップ
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-9 sm:px-8">
        <div className="mb-8 max-w-4xl">
          <p className="text-xs font-black tracking-[0.2em] text-cyan-700">
            FRONTEND IMPLEMENTATION TRAINER
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            APIレスポンスを、page.tsxの処理へ変える。
          </h1>
          <p className="mt-4 leading-8 text-slate-600">
            型、state、副作用、再レンダリング、表示条件の順で整理します。コード例を開く前に、日本語の手順から自分の実装を予想してください。
          </p>
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(560px,1.05fr)]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-cyan-200 bg-cyan-950 p-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-wider text-cyan-300">
                    DESIGN-TRAINERから引き継いだAPI
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    {apiDesign.action}・{apiDesign.resourceLabel}
                  </h2>
                  <p className="mt-2 font-mono text-sm text-cyan-100">
                    {apiDesign.routePath}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFromApi}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20"
                >
                  API設計を再読込
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">1. ページの役割</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="app配下のパス" hint="例: /learning-logs">
                  <input
                    className={inputClass}
                    value={frontend.pagePath}
                    onChange={(event) => update("pagePath", event.target.value)}
                  />
                </Field>
                <Field label="画面タイトル">
                  <input
                    className={inputClass}
                    value={frontend.pageTitle}
                    onChange={(event) => update("pageTitle", event.target.value)}
                  />
                </Field>
                <Field label="Pageコンポーネント名">
                  <input
                    className={inputClass}
                    value={frontend.componentName}
                    onChange={(event) =>
                      update("componentName", event.target.value)
                    }
                  />
                </Field>
                <Field label="dataの形">
                  <select
                    className={inputClass}
                    value={frontend.dataShape}
                    onChange={(event) =>
                      update("dataShape", event.target.value as DataShape)
                    }
                  >
                    <option value="collection">複数件（配列）</option>
                    <option value="single">1件</option>
                    <option value="none">dataなし</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">2. APIのdataを型にする</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="1件の型名">
                  <input
                    className={inputClass}
                    value={frontend.responseTypeName}
                    onChange={(event) =>
                      update("responseTypeName", event.target.value)
                    }
                  />
                </Field>
                <Field label="dataを入れる変数名">
                  <input
                    className={inputClass}
                    value={frontend.dataVariable}
                    onChange={(event) =>
                      update("dataVariable", event.target.value)
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="レスポンス項目"
                    hint="design-trainerと連動・1行に field: 型"
                  >
                    <textarea
                      className={`${inputClass} min-h-64 resize-y font-mono`}
                      value={frontend.responseFields}
                      onChange={(event) =>
                        update("responseFields", event.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">3. 何をきっかけに通信するか</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="実行タイミング">
                  <select
                    className={inputClass}
                    value={frontend.fetchTiming}
                    onChange={(event) =>
                      update("fetchTiming", event.target.value as FetchTiming)
                    }
                  >
                    <option value="mount">初回表示後に1回</option>
                    <option value="dependency">値が変わった後</option>
                    <option value="event">クリック・送信イベント</option>
                  </select>
                </Field>
                {frontend.fetchTiming === "dependency" && (
                  <Field label="変更を監視する値" hint="依存配列へ入る値">
                    <input
                      className={inputClass}
                      value={frontend.dependencyName}
                      onChange={(event) =>
                        update("dependencyName", event.target.value)
                      }
                    />
                  </Field>
                )}
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                {frontend.fetchTiming === "event"
                  ? "ユーザー操作が原因なのでuseEffectではなく、onClickやonSubmitから関数を呼びます。"
                  : `レンダリング後の副作用なのでuseEffectを使います。依存配列は[${frontend.fetchTiming === "dependency" ? frontend.dependencyName : ""}]です。`}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">4. 画面の状態を選ぶ</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Toggle
                  checked={frontend.loadingState}
                  onChange={(value) => update("loadingState", value)}
                  label="読み込み中"
                  description="通信中と完了後の表示を切り替えます。"
                />
                <Toggle
                  checked={frontend.errorState}
                  onChange={(value) => update("errorState", value)}
                  label="通信エラー"
                  description="catchで表示するメッセージを持ちます。"
                />
                <Toggle
                  checked={frontend.emptyState}
                  onChange={(value) => update("emptyState", value)}
                  label="0件表示"
                  description="配列が空のとき専用表示へ切り替えます。"
                />
                <Toggle
                  checked={frontend.retryEnabled}
                  onChange={(value) => update("retryEnabled", value)}
                  label="再読み込み"
                  description="エラー後に同じ取得関数を呼び直します。"
                />
                <Toggle
                  checked={frontend.formState}
                  onChange={(value) => update("formState", value)}
                  label="入力フォーム"
                  description="入力値をformDataとして管理します。"
                />
                <Toggle
                  checked={frontend.successMessageState}
                  onChange={(value) => update("successMessageState", value)}
                  label="成功メッセージ"
                  description="登録・更新・削除の完了を画面へ反映します。"
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
              <p className="text-xs font-black tracking-widest text-cyan-700">
                RENDERING DESIGN
              </p>
              <h2 className="mt-2 text-xl font-black">stateと再レンダリング</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4">state</th>
                      <th className="pb-3 pr-4">初期値</th>
                      <th className="pb-3 pr-4">いつ変わるか</th>
                      <th className="pb-3">画面で起きること</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generated.stateGuides.map((guide) => (
                      <tr key={guide.name} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-mono font-bold text-cyan-700">
                          {guide.name}
                        </td>
                        <td className="py-3 pr-4 font-mono">{guide.initialValue}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {guide.changesWhen}
                        </td>
                        <td className="py-3 text-slate-600">
                          {guide.rerenderResult}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black tracking-widest text-cyan-700">
                JAPANESE PROCESS
              </p>
              <h2 className="mt-2 text-xl font-black">日本語の実装手順</h2>
              <ol className="mt-5 space-y-4">
                {generated.flow.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-black text-cyan-800">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                まず日本語の手順を見て自分で書き、詰まった部分だけコード例と照らし合わせましょう。
              </div>
              <CodeDetails title="必要なTypeScript型" code={generated.typeCode} />
              <CodeDetails title="必要なstate" code={generated.stateCode} />
              <CodeDetails
                title="useEffect・fetch・イベント処理"
                code={generated.effectCode}
              />
              <CodeDetails title="表示の条件分岐" code={generated.conditionCode} />
              <CodeDetails title="page.tsx全体例" code={generated.pageCode} />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black tracking-widest text-emerald-700">
                FRONTEND TEST VIEWPOINTS
              </p>
              <h2 className="mt-2 text-xl font-black">確認する状態</h2>
              <ul className="mt-5 space-y-3">
                {generated.tests.map((test) => (
                  <li key={test} className="flex gap-3 text-sm text-slate-700">
                    <span className="text-emerald-600">□</span>
                    {test}
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
