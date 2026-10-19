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
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('message');
            $table->string('type')->default('notification'); // notification, email, sms
            $table->string('target_type'); // role, class, user, all
            $table->unsignedBigInteger('target_id')->nullable(); 
            $table->timestamps();
        });

        Schema::create('communication_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('communication_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
