<?php

namespace Tests\Feature\Api;

use App\Models\LearningLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexLearningLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_an_empty_array_when_no_learning_logs_exist(): void
    {
        $response = $this->getJson('/api/learning-logs');

        $response->assertStatus(200);
        $response->assertJsonPath(
            'message',
            '学習記録一覧を取得しました。'
        );

        $response->assertJsonPath('data', []);
    }

    public function test_it_returns_learning_logs_in_latest_order(): void
    {
        $oldestLog = LearningLog::create([
            'studied_on' => now()->subDay()->toDateString(),
            'goal' => '昨日の目標',
            'activities' => '昨日の学習内容',
            'next_action' => '今日やること',
        ]);

        $firstTodayLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '今日の最初の目標',
            'activities' => '今日の最初の学習内容',
            'next_action' => '次にやること',
        ]);

        $secondTodayLog = LearningLog::create([
            'studied_on' => now()->toDateString(),
            'goal' => '今日の2番目の目標',
            'activities' => '今日の2番目の学習内容',
            'next_action' => '次にやること',
        ]);

        $response = $this->getJson('/api/learning-logs');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');

        $response->assertJsonPath('data.0.id', $secondTodayLog->id);
        $response->assertJsonPath('data.1.id', $firstTodayLog->id);
        $response->assertJsonPath('data.2.id', $oldestLog->id);
    }
}
