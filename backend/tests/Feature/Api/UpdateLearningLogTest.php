<?php

namespace Tests\Feature\Api;

use App\Models\LearningLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateLearningLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_succeeds(): void
    {
        $learningLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '更新前の目標',
            'activities' => '変更しない学習内容',
            'next_action' => '更新APIをテストする',
        ]);

        $payload = [
            'goal' => '更新後の目標',
        ];

        $response = $this->patchJson(
            "/api/learning-logs/{$learningLog->id}",
            $payload
        );

        $response->assertStatus(200);

        $response->assertJsonPath(
            'message',
            '学習記録を更新しました。'
        );
        $response->assertJsonPath(
            'data.goal',
            '更新後の目標'
        );
        $response->assertJsonPath(
            'data.activities',
            '変更しない学習内容'
        );

        $this->assertDatabaseHas('learning_logs', [
            'id' => $learningLog->id,
            'goal' => '更新後の目標',
            'activities' => '変更しない学習内容',
        ]);

        $this->assertDatabaseCount('learning_logs', 1);
    }

    public function test_future_studied_on_is_rejected(): void
    {
        $originalDate = now()->toDateString();

        $learningLog = LearningLog::create([
            'studied_on' => $originalDate,
            'goal' => '更新前の目標',
            'activities' => '変更しない学習内容',
            'next_action' => '更新APIをテストする',
        ]);

        $payload = [
            'studied_on' => now()->addDay()->toDateString(),
        ];

        $response = $this->patchJson(
            "/api/learning-logs/{$learningLog->id}",
            $payload
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'studied_on',
        ]);
        $response->assertJsonPath(
            'errors.studied_on.0',
            '記録日は今日以前の日にちを入力してください。'
        );

        $this->assertDatabaseHas('learning_logs', [
            'id' => $learningLog->id,
            'studied_on' => $originalDate,
        ]);
    }

    public function test_update_returns_404_when_learning_log_does_not_exist(): void
    {
        $response = $this->patchJson(
            '/api/learning-logs/999',
            [
                'goal' => '更新後の目標',
            ]
        );

        $response->assertStatus(404);
    }
}
