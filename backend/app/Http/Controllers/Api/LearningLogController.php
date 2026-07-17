<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLearningLogRequest;
use App\Http\Requests\UpdateLearningLogRequest;
use App\Models\LearningLog;
use Illuminate\Http\JsonResponse;

class LearningLogController extends Controller
{
    public function index(): JsonResponse
    {
        $learningLogs = LearningLog::query()
            ->orderByDesc('studied_on')
            ->orderByDesc('id')
            ->get();

        $response = [
            'message' => '学習記録一覧を取得しました。',
            'data' => $learningLogs,
        ];

        return response()->json($response, 200);
    }

    public function store(StoreLearningLogRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $learningLog = LearningLog::create($validated);

        $response = [
            'message' => '学習記録を登録しました。',
            'data' => $learningLog,
        ];

        return response()->json($response, 201);
    }

    public function show(LearningLog $learningLog): JsonResponse
    {
        return response()->json([
            'message' => '学習記録を取得しました。',
            'data' => $learningLog,
        ], 200);
    }

    public function update(UpdateLearningLogRequest $request, LearningLog $learningLog): JsonResponse
    {
        $validated = $request->validated();

        $learningLog->update($validated);

        return response()->json([
            'message' => '学習記録を更新しました。',
            'data' => $learningLog->refresh(),
        ], 200);
    }
}
