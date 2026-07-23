"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import LearningLogForm from "@/features/learning-logs/components/LearningLogForm";
import {
  EMPTY_LEARNING_LOG_FORM,
  type FieldErrors,
  type LearningLog,
  type LearningLogFormData,
  type LearningLogResponse,
  type ValidationErrorResponse,
  toLearningLogFormData,
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

export default function EditLearningLogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<LearningLogFormData>({
    ...EMPTY_LEARNING_LOG_FORM,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    getLearningLog(params.id)
      .then((learningLog) => {
        if (isCancelled) {
          return;
        }

        if (!learningLog) {
          setLoadError("学習記録が見つかりませんでした。");
          return;
        }

        setFormData(toLearningLogFormData(learningLog));
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadError("学習記録の取得に失敗しました。");
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
    setLoadError(null);
    setRetryCount((current) => current + 1);
  };

  const handleChange = (
    name: keyof LearningLogFormData,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/learning-logs/${params.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.status === 422) {
        const result: ValidationErrorResponse = await response.json();
        setFieldErrors(result.errors);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update learning log");
      }

      const result: LearningLogResponse = await response.json();
      router.push(`/learning-logs/${result.data.id}`);
    } catch {
      setSubmitError(
        "学習記録の更新に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950">
        <p className="mx-auto max-w-3xl">学習記録を読み込んでいます...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6">
          <p className="font-bold text-rose-800">{loadError}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            >
              再読み込み
            </button>
            <Link
              href="/learning-logs"
              className="rounded-xl border border-slate-300 px-4 py-2 font-bold hover:bg-slate-50"
            >
              一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/learning-logs/${params.id}`}
          className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
        >
          ← 詳細へ戻る
        </Link>
        <p className="mt-8 text-sm font-bold tracking-widest text-indigo-600">
          EDIT LEARNING LOG
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          学習記録を編集
        </h1>

        <LearningLogForm
          formData={formData}
          fieldErrors={fieldErrors}
          error={submitError}
          isSubmitting={isSubmitting}
          submitLabel="変更を保存する"
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
