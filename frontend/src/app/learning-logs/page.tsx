"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  LearningLog,
  LearningLogsResponse,
} from "@/features/learning-logs/types";

async function getLearningLogs(): Promise<LearningLog[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/learning-logs`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch learning logs");
  }

  const result: LearningLogsResponse = await response.json();
  return result.data;
}

export default function LearningLogsPage() {
  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    getLearningLogs()
      .then((result) => {
        if (!isCancelled) {
          setLearningLogs(result);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError("学習記録一覧の取得に失敗しました。");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((currentCount) => currentCount + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
          >
            ← ホームへ
          </Link>
          <Link
            href="/learning-logs/create"
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            新しい記録を登録
          </Link>
        </nav>

        <p className="mt-10 text-sm font-bold tracking-widest text-indigo-600">
          LEARNING LOG
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          学習記録一覧
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          これまで取り組んだ内容と、次にやることを振り返れます。
        </p>

        {isLoading && (
          <p className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            学習記録を読み込んでいます...
          </p>
        )}

        {!isLoading && error && (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-white p-6">
            <p className="font-bold text-rose-800">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            >
              再読み込み
            </button>
          </div>
        )}

        {!isLoading && !error && learningLogs.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-black">学習記録がありません</h2>
            <p className="mt-3 text-slate-600">最初の学習記録を登録しましょう。</p>
            <Link
              href="/learning-logs/create"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              学習記録を登録する
            </Link>
          </div>
        )}

        {!isLoading && !error && learningLogs.length > 0 && (
          <ul className="mt-10 grid gap-5">
            {learningLogs.map((learningLog) => (
              <li
                key={learningLog.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-bold text-indigo-700">
                  {learningLog.studied_on}
                </p>
                <h2 className="mt-2 text-xl font-black">{learningLog.goal}</h2>
                <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-700 md:grid-cols-2">
                  <div>
                    <h3 className="font-bold text-slate-950">今日やったこと</h3>
                    <p className="whitespace-pre-wrap">{learningLog.activities}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">次にやること</h3>
                    <p className="whitespace-pre-wrap">{learningLog.next_action}</p>
                  </div>
                </div>
                <Link
                  href={`/learning-logs/${learningLog.id}`}
                  className="mt-5 inline-flex font-bold text-indigo-700 hover:text-indigo-900"
                >
                  詳細を見る →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
