<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->user = User::factory()->create([
            'email' => 'user_notif@buyedi.com',
        ]);
        $this->user->assignRole('enseignant');
    }

    private function createNotification(User $user, bool $isRead = false, string $title = 'Test Notif'): DatabaseNotification
    {
        return DatabaseNotification::create([
            'id' => (string) Str::uuid(),
            'type' => 'App\Notifications\DemandeDocumentNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => $title,
                'message' => 'Contenu de test pour la notification.',
                'type' => 'demande_document',
            ],
            'read_at' => $isRead ? now() : null,
        ]);
    }

    public function test_notifications_index_returns_exact_unread_and_total_counts(): void
    {
        // 2 non lues et 1 lue
        $this->createNotification($this->user, false, 'Alerte non lue 1');
        $this->createNotification($this->user, false, 'Alerte non lue 2');
        $this->createNotification($this->user, true, 'Alerte lue 1');

        $response = $this->actingAs($this->user)->get('/notifications');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Notifications/Index')
                ->where('unreadCount', 2)
                ->where('totalCount', 3)
                ->where('currentFilter', 'all')
                ->has('notifications.data', 3)
        );
    }

    public function test_notifications_can_be_filtered_by_unread(): void
    {
        $this->createNotification($this->user, false, 'Non lue');
        $this->createNotification($this->user, true, 'Déjà lue');

        $response = $this->actingAs($this->user)->get('/notifications?filter=unread');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Notifications/Index')
                ->where('unreadCount', 1)
                ->where('totalCount', 2)
                ->where('currentFilter', 'unread')
                ->has('notifications.data', 1)
                ->where('notifications.data.0.data.title', 'Non lue')
        );
    }

    public function test_notification_can_be_marked_as_read(): void
    {
        $notif = $this->createNotification($this->user, false);
        $this->assertNull($notif->fresh()->read_at);

        $response = $this->actingAs($this->user)->post("/notifications/{$notif->id}/read");
        $response->assertStatus(302);

        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_all_notifications_can_be_marked_as_read(): void
    {
        $notif1 = $this->createNotification($this->user, false);
        $notif2 = $this->createNotification($this->user, false);

        $response = $this->actingAs($this->user)->post('/notifications/read-all');
        $response->assertStatus(302);

        $this->assertNotNull($notif1->fresh()->read_at);
        $this->assertNotNull($notif2->fresh()->read_at);
    }

    public function test_single_notification_can_be_deleted(): void
    {
        $notif = $this->createNotification($this->user, false);

        $response = $this->actingAs($this->user)->delete("/notifications/{$notif->id}");
        $response->assertStatus(302);

        $this->assertDatabaseMissing('notifications', ['id' => $notif->id]);
    }

    public function test_all_read_notifications_can_be_deleted(): void
    {
        $notifUnread = $this->createNotification($this->user, false, 'Reste');
        $notifRead = $this->createNotification($this->user, true, 'Supprimée');

        $response = $this->actingAs($this->user)->delete('/notifications/destroy-all-read');
        $response->assertStatus(302);

        $this->assertDatabaseHas('notifications', ['id' => $notifUnread->id]);
        $this->assertDatabaseMissing('notifications', ['id' => $notifRead->id]);
    }
}
