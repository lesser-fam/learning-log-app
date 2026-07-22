"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

type LearningLogResponse = {
    message: string;
    data: LearningLog;
};

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

export default function LearningLogPage() {
    const params = useParams<{ id: string }>();

    const [learningLog, setLearningLog] = useState<LearningLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isCancelled = false;

        getLearningLog(params.id)
            .then((result) => {
                if (isCancelled) {
                    return;
                }

                if (result === null) {
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

    return (
        <main>
            <h1>学習記録詳細</h1>
            {isLoading && <p>読み込み中です...</p>}
            {!isLoading && error && (
                <div>
                    <p>{error}</p>
                    <button type="button" onClick={handleRetry}>
                        再読み込み
                    </button>
                </div>
            )}
            {!isLoading && !error && learningLog && (
                <section>
                    <h2>{learningLog.goal}</h2>

                    <dl>
                        <div>
                            <dt>学習日</dt>
                            <dd>{learningLog.studied_on}</dd>
                        </div>

                        <div>
                            <dt>今日やったこと</dt>
                            <dd>{learningLog.activities}</dd>
                        </div>

                        <div>
                            <dt>理解したこと</dt>
                            <dd>{learningLog.learnings ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>詰まったこと</dt>
                            <dd>{learningLog.blockers ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>解決方法</dt>
                            <dd>{learningLog.solution ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>要件</dt>
                            <dd>{learningLog.requirements ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>処理の分解</dt>
                            <dd>{learningLog.process_breakdown ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>実装手順</dt>
                            <dd>
                                {learningLog.implementation_steps ?? "未入力"}
                            </dd>
                        </div>

                        <div>
                            <dt>コード</dt>
                            <dd>
                                <pre>
                                    <code>
                                        {learningLog.code_snippet ?? "未入力"}
                                    </code>
                                </pre>
                            </dd>
                        </div>

                        <div>
                            <dt>未解決の疑問</dt>
                            <dd>{learningLog.open_questions ?? "未入力"}</dd>
                        </div>

                        <div>
                            <dt>次にやること</dt>
                            <dd>{learningLog.next_action}</dd>
                        </div>
                    </dl>
                </section>
            )}

            <Link href="/learning-logs">一覧へ戻る</Link>
        </main>
    );
}
