<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningLog extends Model
{
    protected $fillable = [
        'studied_on',
        'goal',
        'activities',
        'learnings',
        'blockers',
        'solution',
        'requirements',
        'process_breakdown',
        'implementation_steps',
        'code_snippet',
        'open_questions',
        'next_action',
    ];
}
