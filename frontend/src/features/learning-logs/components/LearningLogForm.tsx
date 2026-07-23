"use client";

import type { FormEvent } from "react";
import type {
  FieldErrors,
  LearningLogFormData,
} from "@/features/learning-logs/types";

type LearningLogFormProps = {
  formData: LearningLogFormData;
  fieldErrors: FieldErrors;
  error: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onChange: (name: keyof LearningLogFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type FormField = {
  name: keyof LearningLogFormData;
  label: string;
  required: boolean;
  control: "input" | "textarea";
  type?: "date" | "text";
  placeholder?: string;
};

const FORM_FIELDS: FormField[] = [
  {
    name: "studied_on",
    label: "学習日",
    required: true,
    control: "input",
    type: "date",
  },
  {
    name: "goal",
    label: "実現したいこと",
    required: true,
    control: "input",
    type: "text",
    placeholder: "例：学習記録の登録画面を完成させる",
  },
  {
    name: "activities",
    label: "今日やったこと",
    required: true,
    control: "textarea",
    placeholder: "取り組んだ内容を具体的に記録します",
  },
  {
    name: "learnings",
    label: "理解できたこと",
    required: false,
    control: "textarea",
  },
  {
    name: "blockers",
    label: "詰まったところ",
    required: false,
    control: "textarea",
  },
  {
    name: "solution",
    label: "解決方法",
    required: false,
    control: "textarea",
  },
  {
    name: "requirements",
    label: "条件整理",
    required: false,
    control: "textarea",
  },
  {
    name: "process_breakdown",
    label: "処理の分解",
    required: false,
    control: "textarea",
  },
  {
    name: "implementation_steps",
    label: "日本語の実装手順",
    required: false,
    control: "textarea",
  },
  {
    name: "code_snippet",
    label: "コード",
    required: false,
    control: "textarea",
    placeholder: "覚えておきたいコードを貼り付けます",
  },
  {
    name: "open_questions",
    label: "まだわからないこと",
    required: false,
    control: "textarea",
  },
  {
    name: "next_action",
    label: "次にやること",
    required: true,
    control: "textarea",
    placeholder: "次回、最初に取り組むことを記録します",
  },
];

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function LearningLogForm({
  formData,
  fieldErrors,
  error,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
}: LearningLogFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      noValidate
    >
      {FORM_FIELDS.map((field) => {
        const fieldError = fieldErrors[field.name]?.[0];
        const describedBy = fieldError ? `${field.name}-error` : undefined;

        return (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="flex items-center gap-2 text-sm font-bold text-slate-800"
            >
              {field.label}
              <span
                className={
                  field.required
                    ? "rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                    : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                }
              >
                {field.required ? "必須" : "任意"}
              </span>
            </label>

            {field.control === "input" ? (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                placeholder={field.placeholder}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={describedBy}
                onChange={(event) => onChange(field.name, event.target.value)}
                className={inputClassName}
              />
            ) : (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                placeholder={field.placeholder}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={describedBy}
                onChange={(event) => onChange(field.name, event.target.value)}
                rows={field.name === "code_snippet" ? 8 : 4}
                className={`${inputClassName} resize-y ${
                  field.name === "code_snippet" ? "font-mono text-sm" : ""
                }`}
              />
            )}

            {fieldError && (
              <p
                id={`${field.name}-error`}
                role="alert"
                className="mt-2 text-sm font-medium text-rose-700"
              >
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
      >
        {isSubmitting ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}
