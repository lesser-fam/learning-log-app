"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  patterns,
  technologies,
} from "@/features/pattern-library/patterns";
import type {
  DevelopmentPattern,
  TechnologyId,
} from "@/features/pattern-library/types";

function PatternDetail({ pattern }: { pattern: DevelopmentPattern }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pattern.code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
            {pattern.action}
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {pattern.title}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">{pattern.summary}</p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
        <h3 className="text-xs font-black tracking-widest text-indigo-300">
          頭の中の短縮形
        </h3>
        <p className="mt-3 text-lg font-bold leading-8">{pattern.mentalModel}</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-black text-slate-950">いつ使うか</h3>
        <p className="mt-2 leading-7 text-slate-700">{pattern.useWhen}</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-black text-slate-950">処理の流れ</h3>
        <ol className="mt-4 grid gap-3">
          {pattern.flow.map((step, index) => (
            <li
              key={step}
              className="grid grid-cols-[2rem_1fr] items-start gap-3 rounded-xl border border-slate-200 p-4"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">
                {index + 1}
              </span>
              <span className="pt-1 leading-6 text-slate-800">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-lg font-black text-slate-950">必要な部品・知識</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {pattern.buildingBlocks.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-amber-50 p-5">
          <h3 className="text-lg font-black text-amber-950">
            コードを書く前の質問
          </h3>
          <ul className="mt-4 space-y-3">
            {pattern.questions.map((question) => (
              <li
                key={question}
                className="flex gap-3 leading-6 text-amber-950"
              >
                <span aria-hidden="true">□</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h3 className="text-lg font-black text-slate-950">よくある条件分岐</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-black">条件</th>
                <th className="px-4 py-3 font-black">処理・表示</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pattern.branches.map((branch) => (
                <tr key={branch.condition}>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {branch.condition}
                  </td>
                  <td className="px-4 py-3 leading-6 text-slate-700">
                    {branch.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
        <summary className="cursor-pointer px-5 py-4 font-bold hover:bg-slate-900">
          最小コード例を見る（先に自分で考えてから開く）
        </summary>
        <div className="border-t border-slate-800">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <p className="text-sm font-bold text-slate-300">
              {pattern.codeLabel}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
            >
              {isCopied ? "コピーしました" : "コピー"}
            </button>
          </div>
          <pre className="overflow-x-auto border-t border-slate-800 p-5 text-sm leading-7">
            <code>{pattern.code}</code>
          </pre>
        </div>
      </details>

      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-lg font-black text-emerald-950">実装後の確認</h3>
        <ul className="mt-4 space-y-3">
          {pattern.checklist.map((item) => (
            <li key={item} className="flex gap-3 leading-6 text-emerald-950">
              <span aria-hidden="true">□</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-black tracking-wider text-slate-700">
          公式ドキュメントを探す検索語
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {pattern.searchKeywords.map((keyword) => (
            <li
              key={keyword}
              className="rounded-full bg-blue-50 px-3 py-2 font-mono text-xs text-blue-800"
            >
              {keyword}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default function PatternLibraryPage() {
  const [technologyId, setTechnologyId] =
    useState<TechnologyId>("laravel");
  const [patternId, setPatternId] = useState("laravel-index");

  const filteredPatterns = useMemo(
    () => patterns.filter((pattern) => pattern.technology === technologyId),
    [technologyId],
  );

  const selectedPattern =
    filteredPatterns.find((pattern) => pattern.id === patternId) ??
    filteredPatterns[0];

  const handleTechnologyChange = (nextTechnologyId: TechnologyId) => {
    const firstPattern = patterns.find(
      (pattern) => pattern.technology === nextTechnologyId,
    );

    setTechnologyId(nextTechnologyId);
    if (firstPattern) {
      setPatternId(firstPattern.id);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
        >
          ← ホームへ戻る
        </Link>

        <header className="mt-8 max-w-4xl">
          <p className="text-sm font-black tracking-widest text-indigo-600">
            DEVELOPMENT PATTERN LIBRARY
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            実装パターン辞書
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            経験者が頭の中で当てはめている「いつもの処理」を、技術と用途から確認できます。先に自分で処理を分解し、足りない観点だけを辞書で補ってください。
          </p>
        </header>

        <section className="mt-8 grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-7 text-indigo-950 sm:grid-cols-4">
          {[
            "1. 問題を読む",
            "2. 自分で日本語に分解",
            "3. パターンと比較",
            "4. 自分でコードを書く",
          ].map((step) => (
            <p key={step} className="font-bold">
              {step}
            </p>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-black tracking-widest text-slate-600">
            技術を選ぶ
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {technologies.map((technology) => {
              const isSelected = technology.id === technologyId;

              return (
                <button
                  key={technology.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleTechnologyChange(technology.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-indigo-600 bg-white shadow-md ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black text-white ${technology.color}`}
                  >
                    {technology.shortLabel}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-slate-600">
                    {technology.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
            <label
              htmlFor="pattern-select"
              className="text-sm font-black text-slate-800"
            >
              パターンを選ぶ
            </label>
            <select
              id="pattern-select"
              value={selectedPattern.id}
              onChange={(event) => setPatternId(event.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 lg:hidden"
            >
              {filteredPatterns.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.action}：{pattern.title}
                </option>
              ))}
            </select>

            <nav className="mt-3 hidden space-y-2 lg:block">
              {filteredPatterns.map((pattern) => {
                const isSelected = pattern.id === selectedPattern.id;

                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => setPatternId(pattern.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block text-xs font-black opacity-75">
                      {pattern.action}
                    </span>
                    <span className="mt-1 block text-sm font-bold">
                      {pattern.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <PatternDetail key={selectedPattern.id} pattern={selectedPattern} />
        </div>
      </div>
    </main>
  );
}
