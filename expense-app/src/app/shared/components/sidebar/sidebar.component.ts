import { Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ExpenseService } from '../../services/expense.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: () => number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">Expense<span>Flow</span></div>

      <div class="sidebar-user">
        <div class="user-avatar" [class]="'avatar-' + role">
          {{ auth.userInitials() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ auth.userFullName() }}</div>
          <span class="role-tag" [class]="'role-tag-' + role">{{ role }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        @for (item of navItems; track item.route) {
          <a class="nav-item"
             [routerLink]="item.route"
             routerLinkActive="active"
             [class]="'nav-item-' + role">
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            @if (item.badge && item.badge() > 0) {
              <span class="nav-badge">{{ item.badge() }}</span>
            }
          </a>
        }
      </nav>

      <div class="sidebar-bottom">
        <button class="nav-item nav-item-signout" (click)="auth.logout()">
          <span class="nav-icon">↩</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-w);
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 28px 0 20px;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .sidebar-logo {
      padding: 0 24px 24px;
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
      span { color: var(--text3); font-weight: 300; }
    }

    .sidebar-user {
      padding: 12px 20px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }

    .user-avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0;
      &.avatar-employee { background: rgba(110,231,183,0.12); color: var(--employee); border: 1.5px solid var(--employee); }
      &.avatar-manager  { background: rgba(167,139,250,0.12); color: var(--manager);  border: 1.5px solid var(--manager);  }
    }

    .user-name  { font-size: 14px; font-weight: 600; }
    .role-tag   {
      font-size: 10px; padding: 2px 8px; border-radius: 20px;
      display: inline-block; margin-top: 3px;
      text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;
      &.role-tag-employee { background: rgba(110,231,183,0.12); color: var(--employee); }
      &.role-tag-manager  { background: rgba(167,139,250,0.12); color: var(--manager);  }
    }

    .sidebar-nav { flex: 1; padding: 0 12px; }

    .nav-section-label {
      padding: 8px 12px 4px;
      font-size: 10px; text-transform: uppercase;
      letter-spacing: 1.5px; color: var(--text3); font-weight: 600;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer; transition: all 0.15s;
      color: var(--text2); font-size: 14px; font-weight: 500;
      margin-bottom: 2px; text-decoration: none;
      border: none; background: none; width: 100%; text-align: left;
      position: relative;

      &:hover { background: var(--surface2); color: var(--text); }
      &.active { background: var(--surface3); color: var(--text); }

      &.nav-item-employee.active::before,
      &.nav-item-manager.active::before {
        content: '';
        position: absolute; left: 0; top: 25%; bottom: 25%;
        width: 3px; border-radius: 0 3px 3px 0;
      }
      &.nav-item-employee.active::before { background: var(--employee); }
      &.nav-item-manager.active::before  { background: var(--manager);  }
    }

    .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

    .nav-badge {
      margin-left: auto;
      background: var(--danger); color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 1px 7px; border-radius: 20px;
      font-family: 'JetBrains Mono', monospace;
    }

    .sidebar-bottom {
      padding: 12px 12px 0;
      border-top: 1px solid var(--border);
      margin-top: auto;
    }

    .nav-item-signout { color: var(--text3); &:hover { color: var(--danger); } }
  `],
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  @Input() role: 'employee' | 'manager' = 'employee';

  auth    = inject(AuthService);
  expSvc  = inject(ExpenseService);
}
