<?php

use App\Http\Controllers\Api\LearningLogController;
use Illuminate\Support\Facades\Route;

Route::get('/learning-logs', [LearningLogController::class, 'index']);
Route::post('/learning-logs', [LearningLogController::class, 'store']);
Route::get('/learning-logs/{learningLog}', [LearningLogController::class, 'show']);
