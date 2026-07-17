<?php

namespace Tests\Feature\Api;

use App\Models\LearningLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowLearningLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_succeeds(): void
    {
        $learningLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '詳細取得APIを作る',
            'activities' => 'showメソッドを実装した',
            'next_action' => '更新APIを作る',
        ]);

        $response = $this->getJson("/api/learning-logs/{$learningLog->id}");

        $response->assertStatus(200);
        $response->assertJsonPath(
            'message',
            '学習記録を取得しました。'
        );

        $response->assertJsonPath(
            'data.id',
            $learningLog->id
        );
    }

    public function test_show_errors(): void
    {
        $response = $this->getJson('/api/learning-logs/999');

        $response->assertStatus(404);
    }
}
