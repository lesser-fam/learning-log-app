<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'studied_on' => 'sometimes|required|date|before_or_equal:today',
            'goal' => 'sometimes|required|string|max:255',
            'activities' => 'sometimes|required|string|max:10000',
            'learnings' => 'sometimes|nullable|string|max:10000',
            'blockers' => 'sometimes|nullable|string|max:10000',
            'solution' => 'sometimes|nullable|string|max:10000',
            'requirements' => 'sometimes|nullable|string|max:10000',
            'process_breakdown' => 'sometimes|nullable|string|max:10000',
            'implementation_steps' => 'sometimes|nullable|string|max:10000',
            'code_snippet' => 'sometimes|nullable|string|max:10000',
            'open_questions' => 'sometimes|nullable|string|max:10000',
            'next_action' => 'sometimes|required|string|max:10000',
        ];
    }

    public function messages(): array
    {
        return [
            'studied_on.required' => '記録日を入力してください。',
            'studied_on.date' => '記録日は日付の形式で入力してください。',
            'studied_on.before_or_equal' => '記録日は今日以前の日にちを入力してください。',

            'goal.required' => '実現したいことを入力してください。',
            'goal.string' => '実現したいことは文字列で入力してください。',
            'goal.max' => '実現したいことは255文字以内で入力してください。',

            'activities.required' => '今日やったことを入力してください。',
            'activities.string' => '今日やったことは文字列で入力してください。',
            'activities.max' => '今日やったことは10,000字以内で入力してください。',

            'learnings.string' => '理解できたことは文字列で入力してください。',
            'learnings.max' => '理解できたことは10,000字以内で入力してください。',

            'blockers.string' => '詰まったところは文字列で入力してください。',
            'blockers.max' => '詰まったところは10,000字以内で入力してください。',

            'solution.string' => '解決方法は文字列で入力してください。',
            'solution.max' => '解決方法は10,000字以内で入力してください。',

            'requirements.string' => '条件整理は文字列で入力してください。',
            'requirements.max' => '条件整理は10,000字以内で入力してください。',

            'process_breakdown.string' => '処理の分解は文字列で入力してください。',
            'process_breakdown.max' => '処理の分解は10,000字以内で入力してください。',

            'implementation_steps.string' => '日本語の手順は文字列で入力してください。',
            'implementation_steps.max' => '日本語の手順は10,000字以内で入力してください。',

            'code_snippet.string' => 'コードは文字列で入力してください。',
            'code_snippet.max' => 'コードは10,000字以内で入力してください。',

            'open_questions.string' => '分からないことは文字列で入力してください。',
            'open_questions.max' => '分からないことは10,000字以内で入力してください。',

            'next_action.required' => '次にやることを入力してください。',
            'next_action.string' => '次にやることは文字列で入力してください。',
            'next_action.max' => '次にやることは10,000字以内で入力してください。',

        ];
    }
}
