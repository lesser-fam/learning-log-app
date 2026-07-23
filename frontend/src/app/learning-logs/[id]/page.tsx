"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  LearningLog,
  LearningLogResponse,
} from "@/features/learning-logs/types";

async function getLearningLog(id: string): Promise<LearningLog | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/learning-logs/${id}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch learning log");
  }

  const result: LearningLogResponse = await response.json();
  return result.data;
}

const detailFields: {
  name: keyof LearningLog;
  label: string;
  isCode?: boolean;
}[] = [
  { name: "studied_on", label: "学習日" },
  { name: "activities", label: "今日やったこと" },
  { name: "learnings", label: "理解できたこと" },
  { name: "blockers", label: "詰まったところ" },
  { name: "solution", label: "解決方法" },
  { name: "requirements", label: "条件整理" },
  { name: "process_breakdown", label: "処理の分解" },
  { name: "implementation_steps", label: "日本語の実装手順" },
  { name: "code_snippet", label: "コード", isCode: true },
  { name: "open_questions", label: "まだわからないこと" },
  { name: "next_action", label: "次にやること" },
];

export default function LearningLogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [learningLog, setLearningLog] = useState<LearningLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    getLearningLog(params.id)
      .then((result) => {
        if (isCancelled) {
          return;
        }

        if (!result) {
          setError("学習記録が見つかりませんでした。");
          return;
        }

        setLearningLog(result);
      })
      .catch(() => {
        if (!isCancelled) {
          setError("学習記録の取得に失敗しました。");
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
  }, [params.id, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((currentCount) => currentCount + 1);
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "この学習記録を削除します。削除後は元に戻せません。よろしいですか？",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/learning-logs/${params.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete learning log");
      }

      router.push("/learning-logs");
      router.refresh();
    } catch {
      setDeleteError(
        "学習記録の削除に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/learning-logs"
          className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
        >
          ← 一覧へ戻る
        </Link>

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

        {!isLoading && !error && learningLog && (
          <>
            <header className="mt-8 flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold tracking-widest text-indigo-600">
                  LEARNING LOG DETAIL
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {learningLog.goal}
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/learning-logs/${learningLog.id}/edit`}
                  className="rounded-xl border border-indigo-300 bg-white px-4 py-2 font-bold text-indigo-800 hover:bg-indigo-50"
                >
                  編集する
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-2 font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "削除中..." : "削除する"}
                </button>
              </div>
            </header>

            {deleteError && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-medium text-rose-800"
              >
                {deleteError}
              </p>
            )}

            <dl className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {detailFields.map((field) => {
                const value = learningLog[field.name];
                const displayValue =
                  value === null || value === "" ? "未入力" : String(value);

                return (
                  <div
                    key={field.name}
                    className="grid gap-2 p-5 sm:grid-cols-[12rem_1fr] sm:gap-6 sm:p-6"
                  >
                    <dt className="font-bold text-slate-700">{field.label}</dt>
                    <dd className="min-w-0 whitespace-pre-wrap leading-7 text-slate-900">
                      {field.isCode ? (
                        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                          <code>{displayValue}</code>
                        </pre>
                      ) : (
                        displayValue
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </>
        )}
      </div>
    </main>
  );
}
