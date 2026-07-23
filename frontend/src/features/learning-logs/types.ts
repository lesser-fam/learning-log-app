export type LearningLog = {
  id: number;
  studied_on: string;
  goal: string;
  activities: string;
  learnings: string | null;
  blockers: string | null;
  solution: string | null;
  requirements: string | null;
  process_breakdown: string | null;
  implementation_steps: string | null;
  code_snippet: string | null;
  open_questions: string | null;
  next_action: string;
  created_at: string;
  updated_at: string;
};

export type LearningLogFormData = {
  studied_on: string;
  goal: string;
  activities: string;
  learnings: string;
  blockers: string;
  solution: string;
  requirements: string;
  process_breakdown: string;
  implementation_steps: string;
  code_snippet: string;
  open_questions: string;
  next_action: string;
};

export type FieldErrors = Partial<
  Record<keyof LearningLogFormData, string[]>
>;

export type LearningLogResponse = {
  message: string;
  data: LearningLog;
};

export type LearningLogsResponse = {
  message: string;
  data: LearningLog[];
};

export type ValidationErrorResponse = {
  message: string;
  errors: FieldErrors;
};

export const EMPTY_LEARNING_LOG_FORM: LearningLogFormData = {
  studied_on: "",
  goal: "",
  activities: "",
  learnings: "",
  blockers: "",
  solution: "",
  requirements: "",
  process_breakdown: "",
  implementation_steps: "",
  code_snippet: "",
  open_questions: "",
  next_action: "",
};

export function toLearningLogFormData(
  learningLog: LearningLog,
): LearningLogFormData {
  return {
    studied_on: learningLog.studied_on,
    goal: learningLog.goal,
    activities: learningLog.activities,
    learnings: learningLog.learnings ?? "",
    blockers: learningLog.blockers ?? "",
    solution: learningLog.solution ?? "",
    requirements: learningLog.requirements ?? "",
    process_breakdown: learningLog.process_breakdown ?? "",
    implementation_steps: learningLog.implementation_steps ?? "",
    code_snippet: learningLog.code_snippet ?? "",
    open_questions: learningLog.open_questions ?? "",
    next_action: learningLog.next_action,
  };
}
