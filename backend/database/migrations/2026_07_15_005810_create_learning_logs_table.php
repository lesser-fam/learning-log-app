<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('learning_logs', function (Blueprint $table) {
            $table->id();

            $table->date('studied_on');
            $table->string('goal');
            $table->text('activities');
            $table->text('learnings')->nullable();
            $table->text('blockers')->nullable();
            $table->text('solution')->nullable();
            $table->text('requirements')->nullable();
            $table->text('process_breakdown')->nullable();
            $table->text('implementation_steps')->nullable();
            $table->text('code_snippet')->nullable();
            $table->text('open_questions')->nullable();
            $table->text('next_action');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_logs');
    }
};
