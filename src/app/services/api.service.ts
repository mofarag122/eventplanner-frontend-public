import { Injectable, signal } from '@angular/core';

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiBase = 'http://localhost:8080/api/v1';
  readonly accessToken = signal<string | null>(this.getStoredToken());

  constructor() {
    const stored = this.getStoredToken();
    if (stored) {
      this.accessToken.set(stored);
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private storeToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  logout(): void {
    this.accessToken.set(null);
    localStorage.removeItem('access_token');
  }

  async healthz(): Promise<string> {
    const res = await fetch('http://localhost:8080/healthz');
    if (!res.ok) throw new Error('Health check failed');
    return await res.text();
  }

  async signup(email: string, password: string): Promise<{ id: number; email: string }> {
    const res = await fetch(`${this.apiBase}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await this.extractError(res));
    return await res.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${this.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await this.extractError(res));
    const data = (await res.json()) as LoginResponse;
    this.accessToken.set(data.access_token);
    this.storeToken(data.access_token);
    return data;
  }

  private async extractError(res: Response): Promise<string> {
    try {
      const data = await res.json();
      return (data && (data.message || data.error)) || res.statusText;
    } catch {
      return res.statusText;
    }
  }
}


