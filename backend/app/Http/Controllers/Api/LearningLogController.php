<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLearningLogRequest;
use App\Models\LearningLog;
use Illuminate\Http\JsonResponse;

class LearningLogController extends Controller
{
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
}
