import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent, NavItem } from '../../shared/components/sidebar/sidebar.component';
import { ExpenseService } from '../../shared/services/expense.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-employee-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="shell">
      <app-sidebar [navItems]="navItems" role="employee" />
      <div class="shell-main">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .shell-main { flex: 1; display: flex; flex-direction: column; overflow-x: hidden; }
  `],
})
export class EmployeeShellComponent {
  expSvc = inject(ExpenseService);
  auth   = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Overview',       icon: '⊞', route: '/employee/overview' },
    { label: 'Submit Expense', icon: '＋', route: '/employee/submit' },
    { label: 'My Expenses',    icon: '🧾', route: '/employee/my-expenses' },
    { label: 'Monthly Summary',icon: '📊', route: '/employee/summary' },
  ];

  constructor() {
    // Load user expenses when shell loads
    this.expSvc.loadUserExpenses();
  }
}
