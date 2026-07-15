<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreLearningLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_learning_log_successfully(): void
    {
        $payload = [
            'studied_on' => now()->toDateString(),
            'goal' => '学習記録を1件登録するAPIを作る',
            'activities' => 'マイグレーション、Model、FormRequestを作成した',
            'learnings' => 'リクエストのバリデーション方法を理解した',
            'blockers' => null,
            'solution' => null,
            'requirements' => '学習記録をDBへ1件保存する',
            'process_breakdown' => '検証済みデータを取得してModelで保存する',
            'implementation_steps' => 'リクエストを受け取り、検証して、保存して、レスポンスを返す',
            'code_snippet' => null,
            'open_questions' => null,
            'next_action' => 'Controllerのstoreメソッドを実装する',
        ];

        $response = $this->postJson('/api/learning-logs', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => '学習記録を登録しました。',
        ]);

        $response->assertJsonPath('data.goal', $payload['goal']);

        $this->assertDatabaseHas('learning_logs', [
            'studied_on' => $payload['studied_on'],
            'goal' => $payload['goal'],
            'activities' => $payload['activities'],
            'next_action' => $payload['next_action'],
        ]);
    }

    public function test_goal_is_required(): void
    {
        $payload = [
            'studied_on' => now()->toDateString(),
            // goalは意図的に入れない
            'activities' => '必須項目を省略した場合の確認',
            'next_action' => 'バリデーションエラーを確認する',
        ];

        $response = $this->postJson('/api/learning-logs', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['goal']);

        $response->assertJsonPath(
            'errors.goal.0',
            '実現したいことを入力してください。'
        );

        $this->assertDatabaseCount('learning_logs', 0);
    }

    public function test_studied_on_must_not_be_a_future_date(): void
    {
        $payload = [
            'studied_on' => now()->addDay()->toDateString(),
            'goal' => '学習記録を1件登録するAPIを作る',
            'activities' => '未来の日付を指定した場合の確認',
            'next_action' => 'バリデーションエラーを確認する',
        ];

        $response = $this->postJson('/api/learning-logs', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['studied_on']);

        $response->assertJsonPath(
            'errors.studied_on.0',
            '記録日は今日以前の日にちを入力してください。'
        );

        $this->assertDatabaseCount('learning_logs', 0);
    }
}
