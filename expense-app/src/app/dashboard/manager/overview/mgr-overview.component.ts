import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { ExpenseService } from '../../../shared/services/expense.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-mgr-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Manager Overview</h1>
          <p class="topbar-sub">Team expense management dashboard, {{ auth.userFullName() }}</p>
        </div>
      </header>

      <div class="content">
        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:24px">
          <div class="stat-card c-blue">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value v-blue">{{ total() }}</div>
            <div class="stat-sub">All time</div>
          </div>
          <div class="stat-card c-yellow">
            <div class="stat-label">Pending Action</div>
            <div class="stat-value v-yellow">{{ pendingCount() }}</div>
            <div class="stat-sub">Needs your review</div>
          </div>
          <div class="stat-card c-green">
            <div class="stat-label">Approved (Month)</div>
            <div class="stat-value v-green" style="font-size:22px">₹{{ approvedThisMonth() | number:'1.0-0' }}</div>
            <div class="stat-sub">Reimbursement ready</div>
          </div>
          <div class="stat-card c-purple">
            <div class="stat-label">Rejection Rate</div>
            <div class="stat-value v-purple">{{ rejectionRate() }}%</div>
            <div class="stat-sub">All reviewed</div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Pending queue -->
          <div class="card">
            <div class="section-header">
              <div>
                <div class="section-title">Pending Queue</div>
                <div class="section-sub">Requires immediate attention</div>
              </div>
              <a routerLink="/manager/pending" class="view-all-link">View all →</a>
            </div>
            @if (pendingExpenses().length === 0) {
              <div class="empty-state" style="padding:28px">
                <div class="empty-icon">✅</div>
                <div class="empty-title">All caught up!</div>
                <div class="empty-sub">No pending expenses to review</div>
              </div>
            } @else {
              @for (exp of pendingExpenses(); track exp.id) {
                <div class="queue-row">
                  <div class="queue-info">
                    <div class="queue-title">{{ exp.title }}</div>
                    <div class="queue-meta">{{ exp.userName }} · {{ exp.category }}</div>
                  </div>
                  <div class="queue-actions">
                    <span class="queue-amount">₹{{ exp.amount | number:'1.0-0' }}</span>
                    <button class="tbl-btn approve" (click)="quickApprove(exp.id)">✓</button>
                    <button class="tbl-btn reject"  (click)="quickReject(exp.id)">✕</button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Category breakdown -->
          <div class="card">
            <div class="section-header">
              <div>
                <div class="section-title">Category Summary</div>
                <div class="section-sub">Team spending distribution</div>
              </div>
            </div>
            @for (cat of categories(); track cat.category) {
              <div class="progress-row">
                <div class="progress-label">{{ cat.category }}</div>
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="cat.percent" [style.background]="cat.color"></div>
                </div>
                <div class="progress-val">₹{{ cat.amount | number:'1.0-0' }}</div>
              </div>
            }
            @if (categories().length === 0) {
              <div class="empty-state" style="padding:20px">
                <div class="empty-sub">No expenses yet</div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { display: flex; flex-direction: column; min-height: 100vh; }
    .topbar {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 18px 32px; display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-title { font-size: 18px; font-weight: 700; }
    .topbar-sub   { font-size: 13px; color: var(--text2); margin-top: 2px; }
    .content { padding: 28px 32px; flex: 1; }
    .view-all-link { font-size: 13px; color: var(--manager); font-weight: 600; &:hover { text-decoration: underline; } }

    .queue-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0; border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
    }
    .queue-title  { font-size: 13px; font-weight: 600; }
    .queue-meta   { font-size: 11px; color: var(--text3); margin-top: 2px; }
    .queue-actions { display: flex; align-items: center; gap: 6px; }
    .queue-amount { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; margin-right: 4px; }
  `],
})
export class MgrOverviewComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);
  toast  = inject(ToastService);

  total          = computed(() => this.expSvc.allExpenses().length);
  pendingCount   = computed(() => this.expSvc.pendingCount());
  pendingExpenses = computed(() => this.expSvc.byStatus('Pending').slice(0, 5));
  categories     = computed(() => this.expSvc.categoryBreakdown(this.expSvc.allExpenses()));

  approvedThisMonth = computed(() =>
    this.expSvc.thisMonthExpenses(this.expSvc.allExpenses())
      .filter(e => e.status === 'Approved')
      .reduce((s, e) => s + e.amount, 0)
  );

  rejectionRate = computed(() => {
    const reviewed = this.expSvc.allExpenses().filter(e => e.status !== 'Pending');
    if (!reviewed.length) return 0;
    return Math.round(reviewed.filter(e => e.status === 'Rejected').length / reviewed.length * 100);
  });

  quickApprove(id: string): void {
    this.expSvc.review(id, 'Approved').then(() => {
      this.toast.success('Expense approved ✅');
    });
  }

  quickReject(id: string): void {
    this.expSvc.review(id, 'Rejected', 'Rejected by manager.').then(() => {
      this.toast.error('Expense rejected.');
    });
  }
}
