import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/expense.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

const SESSION_KEY = 'ef_session';
const TOKEN_KEY = 'ef_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private _currentUser = signal<User | null>(null);

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isEmployee   = computed(() => this._currentUser()?.role === 'employee');
  readonly isManager    = computed(() => this._currentUser()?.role === 'manager');
  readonly userFullName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.fname} ${u.lname}` : '';
  });
  readonly userInitials = computed(() => {
    const u = this._currentUser();
    return u ? `${u.fname[0]}${u.lname[0]}`.toUpperCase() : '';
  });

  constructor() {
    this.restoreSession();
  }

  // ── Public API ────────────────────────────────────
  async login(email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/Auth/login`, {
          email,
          password,
          role
        })
      );

      if (response.success && response.data) {
        const user: User = {
          id: response.data.user.id,
          fname: response.data.user.fname,
          lname: response.data.user.lname,
          email: response.data.user.email,
          password: '',
          role: response.data.user.role as UserRole,
          department: response.data.user.department,
          createdAt: response.data.user.createdAt
        };
        
        this.setSession(user, response.data.token);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.error?.error || 'Invalid credentials or wrong role selected.' 
      };
    }
  }

  async register(data: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/Auth/register`, {
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          password: data.password,
          role: data.role,
          department: data.department
        })
      );

      if (response.success && response.data) {
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.error?.error || 'Email is already registered.' 
      };
    }
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // ── Internals ─────────────────────────────────────
  private setSession(user: User, token: string): void {
    this._currentUser.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    const route = user.role === 'employee' ? '/employee/overview' : '/manager/overview';
    this.router.navigate([route]);
  }

  private restoreSession(): void {
    const userJson = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson) as User;
        this._currentUser.set(user);
      } catch {
        this.logout();
      }
    }
  }
}
