"use client";

import { useEffect, useState } from "react";

type LearningLog = {
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

type LearningLogsResponse = {
    message: string;
    data: LearningLog[];
};

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
        <main>
            <h1>学習記録一覧</h1>
            {isLoading && <p>読み込み中です...</p>}
            {!isLoading && error && (
                <div>
                    <p>{error}</p>
                    <button type="button" onClick={handleRetry}>
                        再読み込み
                    </button>
                </div>
            )}
            {!isLoading && !error && learningLogs.length === 0 && (
                <div>
                    <p>学習記録一覧がありません。</p>
                    <p>学習記録を登録しましょう。</p>
                </div>
            )}
            {!isLoading && !error && learningLogs.length > 0 && (
                <ul>
                    {learningLogs.map((learningLog) => (
                        <li key={learningLog.id}>
                            <p>学習日：{learningLog.studied_on}</p>
                            <h2>{learningLog.goal}</h2>
                            <p>今日やったこと：{learningLog.activities}</p>
                            <p>次にやること：{learningLog.next_action}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
