import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent, NavItem } from '../../shared/components/sidebar/sidebar.component';
import { ExpenseService } from '../../shared/services/expense.service';

@Component({
  selector: 'app-manager-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="shell">
      <app-sidebar [navItems]="navItems" role="manager" />
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
export class ManagerShellComponent {
  expSvc = inject(ExpenseService);

  navItems: NavItem[] = [
    { label: 'Overview',         icon: '⊞', route: '/manager/overview' },
    { label: 'Pending Approvals',icon: '⏳', route: '/manager/pending', badge: () => this.expSvc.pendingCount() },
    { label: 'All Expenses',     icon: '📋', route: '/manager/all-expenses' },
    { label: 'Monthly Reports',  icon: '📊', route: '/manager/reports' },
  ];

  constructor() {
    // Load all expenses when shell loads
    this.expSvc.loadAllExpenses();
  }
}
