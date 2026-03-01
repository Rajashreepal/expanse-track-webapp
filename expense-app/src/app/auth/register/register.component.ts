import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { UserRole, DEPARTMENTS } from '../../shared/models/expense.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-hero">
        <div class="hero-glow glow-1"></div>
        <div class="hero-glow glow-2"></div>
        <div class="hero-logo">Expense<span>Flow</span></div>
        <h1 class="hero-heading">Join your team<br>on <em>ExpenseFlow</em></h1>
        <p class="hero-sub">Set up your account in under 2 minutes. Instant access to expense submission or team approval — your choice.</p>
        <div class="feature-list">
          <div class="feature-item">✦ Role-based dashboards</div>
          <div class="feature-item">✦ Receipt upload & tracking</div>
          <div class="feature-item">✦ Real-time approval status</div>
          <div class="feature-item">✦ Monthly spending reports</div>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-card">
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-sub">Choose your role to get started</p>

          <div class="role-selector">
            <button class="role-btn"
              [class.selected-employee]="selectedRole() === 'employee'"
              (click)="selectedRole.set('employee')">
              <div class="role-icon">👤</div>
              <div class="role-name">Employee</div>
              <div class="role-desc">Submit & track expenses</div>
            </button>
            <button class="role-btn"
              [class.selected-manager]="selectedRole() === 'manager'"
              (click)="selectedRole.set('manager')">
              <div class="role-icon">👔</div>
              <div class="role-name">Manager</div>
              <div class="role-desc">Review & approve</div>
            </button>
          </div>

          <form #regForm="ngForm" (ngSubmit)="handleRegister(regForm)" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input class="form-control" name="fname" type="text"
                  [(ngModel)]="fname" required #fnameRef="ngModel"
                  placeholder="Alex">
                @if (fnameRef.invalid && fnameRef.touched) {
                  <span class="form-error">First name is required.</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input class="form-control" name="lname" type="text"
                  [(ngModel)]="lname" required #lnameRef="ngModel"
                  placeholder="Johnson">
                @if (lnameRef.invalid && lnameRef.touched) {
                  <span class="form-error">Last name is required.</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input class="form-control" name="email" type="email"
                [(ngModel)]="email" required email #emailRef="ngModel"
                placeholder="alex@company.com">
              @if (emailRef.invalid && emailRef.touched) {
                <span class="form-error">Please enter a valid email.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Department *</label>
              <select class="form-control" name="department"
                [(ngModel)]="department" required #deptRef="ngModel">
                <option value="">Select department</option>
                @for (dept of departments; track dept) {
                  <option [value]="dept">{{ dept }}</option>
                }
              </select>
              @if (deptRef.invalid && deptRef.touched) {
                <span class="form-error">Please select your department.</span>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Password *</label>
                <input class="form-control" name="password" type="password"
                  [(ngModel)]="password" required minlength="6" #passRef="ngModel"
                  placeholder="Min. 6 characters">
                @if (passRef.invalid && passRef.touched) {
                  <span class="form-error">Min 6 characters required.</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label">Confirm Password *</label>
                <input class="form-control" name="confirm" type="password"
                  [(ngModel)]="confirm" required #confirmRef="ngModel"
                  placeholder="Repeat password">
                @if (confirmRef.touched && confirm !== password) {
                  <span class="form-error">Passwords do not match.</span>
                }
              </div>
            </div>

            @if (errorMsg()) {
              <div class="alert-error">⚠️ {{ errorMsg() }}</div>
            }

            <button class="btn btn-full btn-lg"
              [class.btn-primary]="selectedRole() === 'employee'"
              [class.btn-manager-primary]="selectedRole() === 'manager'"
              type="submit"
              [disabled]="loading()">
              {{ loading() ? 'Creating account…' : 'Create ' + (selectedRole() === 'employee' ? 'Employee' : 'Manager') + ' Account' }}
            </button>
          </form>

          <p class="auth-switch">
            Already have an account? <a routerLink="/login">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }

    .auth-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1a1035 60%, #0f172a 100%);
      display: flex; flex-direction: column; justify-content: center;
      padding: 60px; position: relative; overflow: hidden;
    }

    .hero-glow {
      position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none;
      &.glow-1 { top: -150px; right: -100px; width: 450px; height: 450px; background: rgba(167,139,250,0.15); animation: pulse 7s ease-in-out infinite; }
      &.glow-2 { bottom: -100px; left: -100px; width: 350px; height: 350px; background: rgba(110,231,183,0.1); animation: pulse 9s ease-in-out infinite reverse; }
    }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.6; } 50% { transform: scale(1.15); opacity:1; } }

    .hero-logo {
      font-size: 24px; font-weight: 700; color: var(--accent);
      margin-bottom: 50px; position: relative; z-index: 1;
      span { color: var(--text3); font-weight: 300; }
    }

    .hero-heading {
      font-size: 42px; font-weight: 700; line-height: 1.1; color: var(--text);
      margin-bottom: 18px; position: relative; z-index: 1;
      em { font-style: normal; background: linear-gradient(90deg, var(--manager), #c4b5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    }

    .hero-sub {
      font-size: 15px; color: var(--text2); line-height: 1.7;
      max-width: 380px; position: relative; z-index: 1; margin-bottom: 36px;
    }

    .feature-list { position: relative; z-index: 1; }
    .feature-item {
      font-size: 13px; color: var(--text2); padding: 8px 0;
      border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
    }

    .auth-panel {
      background: var(--surface);
      display: flex; align-items: center; justify-content: center;
      padding: 40px;
    }

    .auth-card { width: 100%; max-width: 440px; }
    .auth-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .auth-sub   { font-size: 14px; color: var(--text2); margin-bottom: 28px; }

    .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }

    .role-btn {
      background: var(--surface2); border: 2px solid var(--border);
      border-radius: var(--radius); padding: 12px 14px;
      cursor: pointer; transition: all 0.2s; text-align: center; color: var(--text2);
      .role-icon { font-size: 20px; margin-bottom: 5px; }
      .role-name { font-size: 13px; font-weight: 600; display: block; }
      .role-desc { font-size: 11px; color: var(--text3); display: block; margin-top: 2px; }
      &.selected-employee { border-color: var(--employee); background: rgba(110,231,183,0.08); color: var(--employee); }
      &.selected-manager  { border-color: var(--manager);  background: rgba(167,139,250,0.08); color: var(--manager);  }
    }

    .alert-error {
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
      color: var(--danger); padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 13px; margin-bottom: 16px;
    }

    .auth-switch {
      text-align: center; margin-top: 20px; font-size: 13px; color: var(--text2);
      a { color: var(--accent); font-weight: 600; &:hover { text-decoration: underline; } }
    }

    @media (max-width: 900px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-hero { display: none; }
    }
  `],
})
export class RegisterComponent {
  auth   = inject(AuthService);
  toast  = inject(ToastService);
  router = inject(Router);

  selectedRole = signal<UserRole>('employee');
  departments  = DEPARTMENTS;

  fname = ''; lname = ''; email = ''; department = '';
  password = ''; confirm = '';
  errorMsg = signal('');
  loading  = signal(false);

  handleRegister(form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid || this.password !== this.confirm) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.register({
      fname: this.fname, lname: this.lname, email: this.email,
      password: this.password, role: this.selectedRole(), department: this.department,
    }).then(result => {
      if (result.success) {
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/login']);
      } else {
        this.errorMsg.set(result.error || 'Registration failed.');
        this.loading.set(false);
      }
    });
  }
}
