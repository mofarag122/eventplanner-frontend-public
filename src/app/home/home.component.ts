import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <section class="center">
      <div class="dashboard">
        <div class="card welcome-card">
          <h2 style="margin:0 0 .5rem">Welcome to Evoplanner</h2>
          <p class="muted">Your intelligent planning assistant</p>
          <div class="health-status">
            @if (health()) {
            <span class="status-indicator" [class.healthy]="health() !== 'down'"></span>
            <span class="muted">Service: {{ health() }}</span>
            } @else {
            <span class="muted">Checking service status…</span>
            }
          </div>
        </div>

        <div class="cards-grid">
          <div class="card stat-card">
            <div class="stat-icon">📋</div>
            <h3 style="margin:0 0 .25rem">Plans</h3>
            <p class="muted" style="font-size:0.875rem">Create and manage your plans</p>
            <p style="font-size:2rem;font-weight:700;margin:.5rem 0 0">0</p>
          </div>

          <div class="card stat-card">
            <div class="stat-icon">📅</div>
            <h3 style="margin:0 0 .25rem">Events</h3>
            <p class="muted" style="font-size:0.875rem">Track upcoming events</p>
            <p style="font-size:2rem;font-weight:700;margin:.5rem 0 0">0</p>
          </div>

          <div class="card stat-card">
            <div class="stat-icon">✓</div>
            <h3 style="margin:0 0 .25rem">Completed</h3>
            <p class="muted" style="font-size:0.875rem">Tasks completed this week</p>
            <p style="font-size:2rem;font-weight:700;margin:.5rem 0 0">0</p>
          </div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 1rem">Quick Actions</h3>
          <div style="display:flex;gap:.75rem;flex-wrap:wrap">
            <button class="btn">+ New Plan</button>
            <button class="btn btn-secondary">+ New Event</button>
            <button class="btn btn-secondary">View Calendar</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
    .dashboard {
      width: 100%;
      max-width: 900px;
      display: grid;
      gap: 1.5rem;
    }
    
    .welcome-card {
      text-align: center;
      padding: 2rem 1.25rem;
    }
    
    .health-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      margin-top: 1rem;
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--error);
    }
    
    .status-indicator.healthy {
      background: var(--success);
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .stat-card {
      text-align: center;
    }
    
    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: .75rem;
    }
    `,
  ],
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly health = signal<string | null>(null);
  readonly token = computed(() => this.api.accessToken());

  constructor() {
    this.api
      .healthz()
      .then((h) => this.health.set(h))
      .catch(() => this.health.set('down'));
    if (!this.token()) {
      // If not authenticated, go to login
      queueMicrotask(() => this.router.navigateByUrl('/login'));
    }
  }
}
