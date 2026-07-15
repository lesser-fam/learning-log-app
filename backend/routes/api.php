<?php

use App\Http\Controllers\Api\LearningLogController;
use Illuminate\Support\Facades\Route;

Route::post('/learning-logs', [LearningLogController::class, 'store']);
