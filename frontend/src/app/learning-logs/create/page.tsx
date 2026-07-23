"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import LearningLogForm from "@/features/learning-logs/components/LearningLogForm";
import {
  EMPTY_LEARNING_LOG_FORM,
  type FieldErrors,
  type LearningLogFormData,
  type LearningLogResponse,
  type ValidationErrorResponse,
} from "@/features/learning-logs/types";

export default function CreateLearningLogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LearningLogFormData>({
    ...EMPTY_LEARNING_LOG_FORM,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/learning-logs`,
        {
          method: "POST",
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
        throw new Error("Failed to create learning log");
      }

      const result: LearningLogResponse = await response.json();
      router.push(`/learning-logs/${result.data.id}`);
    } catch {
      setError("学習記録の登録に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/learning-logs"
          className="text-sm font-bold text-indigo-700 hover:text-indigo-900"
        >
          ← 一覧へ戻る
        </Link>
        <p className="mt-8 text-sm font-bold tracking-widest text-indigo-600">
          NEW LEARNING LOG
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          学習記録を登録
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          今日の学習を整理し、次に取り組むことまで記録します。
        </p>

        <LearningLogForm
          formData={formData}
          fieldErrors={fieldErrors}
          error={error}
          isSubmitting={isSubmitting}
          submitLabel="学習記録を登録する"
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
