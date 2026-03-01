import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { ExpenseService } from '../../../shared/services/expense.service';

@Component({
  selector: 'app-emp-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap fade-in">
      <!-- Top bar -->
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Overview</h1>
          <p class="topbar-sub">Welcome back, {{ auth.userFullName() }}! Here's your expense snapshot.</p>
        </div>
        <div class="topbar-actions">
          <a routerLink="/employee/submit" class="btn btn-primary btn-sm">+ New Expense</a>
        </div>
      </header>

      <div class="content">
        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:24px">
          <div class="stat-card c-blue">
            <div class="stat-label">Submitted (Month)</div>
            <div class="stat-value v-blue">{{ thisMonthCount() }}</div>
            <div class="stat-sub">Total this month</div>
          </div>
          <div class="stat-card c-yellow">
            <div class="stat-label">Pending Review</div>
            <div class="stat-value v-yellow">{{ pendingCount() }}</div>
            <div class="stat-sub">Awaiting manager</div>
          </div>
          <div class="stat-card c-green">
            <div class="stat-label">Approved</div>
            <div class="stat-value v-green">{{ approvedCount() }}</div>
            <div class="stat-sub">Ready for reimbursement</div>
          </div>
          <div class="stat-card c-red">
            <div class="stat-label">Rejected</div>
            <div class="stat-value v-red">{{ rejectedCount() }}</div>
            <div class="stat-sub">Needs revision</div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Category breakdown -->
          <div class="card">
            <div class="section-header">
              <div>
                <div class="section-title">Spending by Category</div>
                <div class="section-sub">All time breakdown</div>
              </div>
            </div>
            @if (categoryData().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-title">No data yet</div>
                <div class="empty-sub">Submit an expense to see your breakdown</div>
              </div>
            } @else {
              @for (cat of categoryData(); track cat.category) {
                <div class="progress-row">
                  <div class="progress-label" [title]="cat.category">{{ cat.category }}</div>
                  <div class="progress-track">
                    <div class="progress-fill" [style.width.%]="cat.percent" [style.background]="cat.color"></div>
                  </div>
                  <div class="progress-val">₹{{ cat.amount | number:'1.0-0' }}</div>
                </div>
              }
            }
          </div>

          <!-- Recent expenses -->
          <div class="card">
            <div class="section-header">
              <div class="section-title">Recent Expenses</div>
              <a routerLink="/employee/my-expenses" class="view-all-link">View all →</a>
            </div>
            @if (recentExpenses().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">🧾</div>
                <div class="empty-title">No expenses yet</div>
                <div class="empty-sub">
                  <a routerLink="/employee/submit" style="color:var(--accent)">Submit your first expense →</a>
                </div>
              </div>
            } @else {
              @for (exp of recentExpenses(); track exp.id) {
                <div class="recent-row">
                  <div>
                    <div class="recent-title">{{ exp.title }}</div>
                    <div class="recent-meta">{{ exp.category }} · {{ exp.date }}</div>
                  </div>
                  <div style="text-align:right">
                    <div class="recent-amount">₹{{ exp.amount | number:'1.0-0' }}</div>
                    <span class="badge" [class]="'badge-' + exp.status.toLowerCase()">{{ exp.status }}</span>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Approved amount banner -->
        @if (totalApprovedAmount() > 0) {
          <div class="approved-banner">
            <div class="approved-banner-left">
              <div class="approved-banner-label">Total Approved Amount (All Time)</div>
              <div class="approved-banner-val">₹{{ totalApprovedAmount() | number:'1.0-0' }}</div>
            </div>
            <div class="approved-banner-right">
              💰 Ready for reimbursement processing
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { display: flex; flex-direction: column; min-height: 100vh; }

    .topbar {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 18px 32px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-title { font-size: 18px; font-weight: 700; }
    .topbar-sub   { font-size: 13px; color: var(--text2); margin-top: 2px; }
    .topbar-actions { display: flex; gap: 10px; }

    .content { padding: 28px 32px; flex: 1; }

    .recent-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0; border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
    }
    .recent-title  { font-size: 13px; font-weight: 600; }
    .recent-meta   { font-size: 11px; color: var(--text3); margin-top: 3px; }
    .recent-amount { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }

    .view-all-link { font-size: 13px; color: var(--accent); font-weight: 600; &:hover { text-decoration: underline; } }

    .approved-banner {
      margin-top: 20px;
      background: linear-gradient(135deg, rgba(110,231,183,0.08), rgba(56,189,248,0.08));
      border: 1px solid rgba(110,231,183,0.2);
      border-radius: var(--radius);
      padding: 20px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .approved-banner-label { font-size: 12px; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
    .approved-banner-val   { font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--success); }
    .approved-banner-right { font-size: 13px; color: var(--text2); }
  `],
})
export class EmpOverviewComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);

  private myExpenses = computed(() => this.expSvc.forUser(this.auth.currentUser()?.id || ''));

  thisMonthCount   = computed(() => this.expSvc.thisMonthExpenses(this.myExpenses()).length);
  pendingCount     = computed(() => this.myExpenses().filter(e => e.status === 'Pending').length);
  approvedCount    = computed(() => this.myExpenses().filter(e => e.status === 'Approved').length);
  rejectedCount    = computed(() => this.myExpenses().filter(e => e.status === 'Rejected').length);
  recentExpenses   = computed(() => this.myExpenses().slice(0, 5));
  categoryData     = computed(() => this.expSvc.categoryBreakdown(this.myExpenses()));
  totalApprovedAmount = computed(() =>
    this.myExpenses().filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0)
  );
}
