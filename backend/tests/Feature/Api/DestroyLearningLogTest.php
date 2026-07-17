<?php

namespace Tests\Feature\Api;

use App\Models\LearningLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DestroyLearningLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_destroy_succeeds(): void
    {
        $deletingLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '削除する学習記録',
            'activities' => '削除APIを確認する',
            'next_action' => '削除テストを書く',
        ]);

        $remainingLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '残す学習記録',
            'activities' => '削除対象以外が残るか確認する',
            'next_action' => '次の機能を考える',
        ]);

        $response = $this->deleteJson(
            "/api/learning-logs/{$deletingLog->id}"
        );

        $response->assertStatus(200);
        $response->assertJsonPath(
            'message',
            '学習記録を削除しました。'
        );

        $this->assertDatabaseMissing('learning_logs', [
            'id' => $deletingLog->id,
        ]);
        $this->assertDatabaseHas('learning_logs', [
            'id' => $remainingLog->id,
        ]);
        $this->assertDatabaseCount('learning_logs', 1);
    }

    public function test_destroy_returns_404_when_learning_log_does_not_exist(): void
    {
        $response = $this->deleteJson(
            '/api/learning-logs/999'
        );

        $response->assertStatus(404);
    }
}
