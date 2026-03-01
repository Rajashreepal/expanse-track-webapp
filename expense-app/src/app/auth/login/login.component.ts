import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { UserRole } from '../../shared/models/expense.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Hero panel -->
      <div class="auth-hero">
        <div class="hero-glow glow-1"></div>
        <div class="hero-glow glow-2"></div>

        <div class="hero-logo">Expense<span>Flow</span></div>
        <h1 class="hero-heading">
          Manage expenses<br>with <em>zero friction</em>
        </h1>
        <p class="hero-sub">
          From receipt upload to manager approval — streamlined, transparent,
          and lightning fast. Built for modern finance teams.
        </p>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-val">98%</div>
            <div class="hero-stat-label">Approval Rate</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-val">2.4h</div>
            <div class="hero-stat-label">Avg. Approval</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-val">500+</div>
            <div class="hero-stat-label">Teams Active</div>
          </div>
        </div>
      </div>

      <!-- Form panel -->
      <div class="auth-panel">
        <div class="auth-card">
          <h2 class="auth-title">Welcome back 👋</h2>
          <p class="auth-sub">Sign in to your ExpenseFlow account</p>

          <!-- Role selector -->
          <div class="role-selector">
            <button class="role-btn"
              [class.selected-employee]="selectedRole() === 'employee'"
              (click)="selectedRole.set('employee')">
              <div class="role-icon">👤</div>
              <div class="role-name">Employee</div>
              <div class="role-desc">Submit expenses</div>
            </button>
            <button class="role-btn"
              [class.selected-manager]="selectedRole() === 'manager'"
              (click)="selectedRole.set('manager')">
              <div class="role-icon">👔</div>
              <div class="role-name">Manager</div>
              <div class="role-desc">Approve / reject</div>
            </button>
          </div>

          <!-- Login form -->
          <form #loginForm="ngForm" (ngSubmit)="handleLogin(loginForm)" novalidate>
            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input
                class="form-control"
                id="email" name="email" type="email"
                [(ngModel)]="email" required email
                #emailRef="ngModel"
                placeholder="you@company.com">
              @if (emailRef.invalid && emailRef.touched) {
                <span class="form-error">Please enter a valid email address.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input
                class="form-control"
                id="password" name="password" type="password"
                [(ngModel)]="password" required minlength="6"
                #passRef="ngModel"
                placeholder="••••••••">
              @if (passRef.invalid && passRef.touched) {
                <span class="form-error">Password must be at least 6 characters.</span>
              }
            </div>

            @if (errorMsg()) {
              <div class="alert-error">⚠️ {{ errorMsg() }}</div>
            }

            <button class="btn btn-full btn-lg"
              [class.btn-primary]="selectedRole() === 'employee'"
              [class.btn-manager-primary]="selectedRole() === 'manager'"
              type="submit"
              [disabled]="loading()">
              {{ loading() ? 'Signing in…' : 'Sign In as ' + (selectedRole() === 'employee' ? 'Employee' : 'Manager') }}
            </button>
          </form>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">Quick Demo</span>
            <span class="divider-line"></span>
          </div>

          <div class="demo-btns">
            <button class="demo-btn demo-emp" (click)="demoLogin('employee')">
              🟢 Employee Demo
            </button>
            <button class="demo-btn demo-mgr" (click)="demoLogin('manager')">
              🟣 Manager Demo
            </button>
          </div>

          <p class="auth-switch">
            Don't have an account?
            <a routerLink="/register">Create one →</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
    }

    /* Hero */
    .auth-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%);
      display: flex; flex-direction: column; justify-content: center;
      padding: 60px; position: relative; overflow: hidden;
    }

    .hero-glow {
      position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none;
      &.glow-1 { top: -200px; left: -150px; width: 500px; height: 500px; background: rgba(110,231,183,0.15); animation: pulse 6s ease-in-out infinite; }
      &.glow-2 { bottom: -150px; right: -100px; width: 400px; height: 400px; background: rgba(56,189,248,0.12); animation: pulse 8s ease-in-out infinite reverse; }
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); opacity: .6; }
      50% { transform: scale(1.15); opacity: 1; }
    }

    .hero-logo {
      font-size: 26px; font-weight: 700; color: var(--accent);
      letter-spacing: -0.5px; margin-bottom: 56px; position: relative; z-index: 1;
      span { color: var(--text3); font-weight: 300; }
    }

    .hero-heading {
      font-size: 46px; font-weight: 700; line-height: 1.1; color: var(--text);
      margin-bottom: 20px; position: relative; z-index: 1;
      em { font-style: normal; background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    }

    .hero-sub {
      font-size: 15px; color: var(--text2); line-height: 1.7;
      max-width: 380px; position: relative; z-index: 1; margin-bottom: 48px;
    }

    .hero-stats {
      display: flex; gap: 40px; position: relative; z-index: 1;
    }

    .hero-stat-val { font-size: 30px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .hero-stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

    /* Form panel */
    .auth-panel {
      background: var(--surface);
      display: flex; align-items: center; justify-content: center;
      padding: 48px 40px;
    }

    .auth-card { width: 100%; max-width: 420px; }
    .auth-title { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
    .auth-sub   { font-size: 14px; color: var(--text2); margin-bottom: 32px; }

    /* Role selector */
    .role-selector {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px;
    }

    .role-btn {
      background: var(--surface2); border: 2px solid var(--border);
      border-radius: var(--radius); padding: 14px 16px;
      cursor: pointer; transition: all 0.2s;
      text-align: center; color: var(--text2);
      .role-icon { font-size: 22px; margin-bottom: 6px; }
      .role-name { font-size: 13px; font-weight: 600; display: block; }
      .role-desc { font-size: 11px; color: var(--text3); display: block; margin-top: 2px; }

      &.selected-employee { border-color: var(--employee); background: rgba(110,231,183,0.08); color: var(--employee); .role-desc { color: rgba(110,231,183,0.5); } }
      &.selected-manager  { border-color: var(--manager);  background: rgba(167,139,250,0.08); color: var(--manager);  .role-desc { color: rgba(167,139,250,0.5); } }
    }

    .alert-error {
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
      color: var(--danger); padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 13px; margin-bottom: 16px;
    }

    /* Divider */
    .divider-row {
      display: flex; align-items: center; gap: 12px; margin: 20px 0;
    }
    .divider-line { flex: 1; height: 1px; background: var(--border); }
    .divider-text { font-size: 12px; color: var(--text3); white-space: nowrap; }

    /* Demo buttons */
    .demo-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .demo-btn {
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 9px;
      font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      &.demo-emp { color: var(--employee); border-color: rgba(110,231,183,0.2); &:hover { background: rgba(110,231,183,0.08); } }
      &.demo-mgr { color: var(--manager);  border-color: rgba(167,139,250,0.2); &:hover { background: rgba(167,139,250,0.08); } }
    }

    .auth-switch {
      text-align: center; margin-top: 24px; font-size: 13px; color: var(--text2);
      a { color: var(--accent); font-weight: 600; &:hover { text-decoration: underline; } }
    }

    @media (max-width: 900px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-hero { display: none; }
    }
  `],
})
export class LoginComponent {
  auth    = inject(AuthService);
  toast   = inject(ToastService);

  selectedRole = signal<UserRole>('employee');
  email    = '';
  password = '';
  errorMsg = signal('');
  loading  = signal(false);

  handleLogin(form: NgForm): void {
    if (form.invalid) { form.control.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.email, this.password, this.selectedRole()).then(result => {
      if (result.success) {
        this.toast.success(`Welcome back! 👋`);
      } else {
        this.errorMsg.set(result.error || 'Login failed.');
        this.loading.set(false);
      }
    });
  }

  demoLogin(role: UserRole): void {
    this.selectedRole.set(role);
    const creds = { employee: { email: 'employee@demo.com', password: 'demo123' }, manager: { email: 'manager@demo.com', password: 'demo123' } };
    this.auth.login(creds[role].email, creds[role].password, role).then(result => {
      if (result.success) {
        this.toast.success(`Logged in as demo ${role}!`);
      }
    });
  }
}
