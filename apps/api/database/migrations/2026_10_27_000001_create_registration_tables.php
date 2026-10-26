<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendees', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone', 20)->unique();
            $table->string('email')->nullable();
            $table->string('church')->nullable();
            $table->string('location')->nullable();
            $table->string('age_band', 8);
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendee_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('category', 16);
            $table->string('mode', 8);
            $table->json('days');
            $table->boolean('needs_accommodation')->default(false);
            $table->string('status', 16)->default('confirmed');
            $table->string('claim_code', 20)->unique();
            $table->timestamp('consented_at')->nullable();
            $table->timestamps();
            $table->index(['mode', 'status']);
        });

        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20)->index();
            $table->string('code_hash', 64);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('capacity_counters', function (Blueprint $table) {
            $table->string('name')->primary();
            $table->unsignedInteger('taken')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capacity_counters');
        Schema::dropIfExists('otp_codes');
        Schema::dropIfExists('registrations');
        Schema::dropIfExists('attendees');
    }
};
