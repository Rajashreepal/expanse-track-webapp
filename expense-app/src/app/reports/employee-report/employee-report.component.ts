import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseService } from '../../shared/services/expense.service';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Monthly Summary</h1>
          <p class="topbar-sub">Your personal expense analytics</p>
        </div>
      </header>

      <div class="content">
        <!-- Monthly cards -->
        <div class="grid-3" style="margin-bottom:24px">
          @for (m of monthlies(); track m.month) {
            <div class="summary-card">
              <div class="summary-month">{{ m.month }}</div>
              <div class="summary-amount">₹{{ m.total | number:'1.0-0' }}</div>
              <div class="summary-meta">
                <span>{{ m.count }}</span> expenses ·
                ₹<span>{{ m.approved | number:'1.0-0' }}</span> approved
              </div>
              <div class="month-bars">
                <div class="month-bar-item">
                  <div class="month-bar-fill" style="background:var(--success)"
                    [style.width.%]="m.total ? m.approved/m.total*100 : 0"></div>
                  <span>Approved</span>
                </div>
                <div class="month-bar-item">
                  <div class="month-bar-fill" style="background:var(--warning)"
                    [style.width.%]="m.total ? m.pending/m.total*100 : 0"></div>
                  <span>Pending</span>
                </div>
                <div class="month-bar-item">
                  <div class="month-bar-fill" style="background:var(--danger)"
                    [style.width.%]="m.total ? m.rejected/m.total*100 : 0"></div>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          }
          @if (monthlies().length === 0) {
            <div class="empty-state" style="grid-column:span 3">
              <div class="empty-icon">📊</div>
              <div class="empty-title">No expense history</div>
              <div class="empty-sub">Start submitting expenses to see your monthly summary</div>
            </div>
          }
        </div>

        <div class="grid-2">
          <!-- Category breakdown -->
          <div class="card">
            <div class="section-header">
              <div>
                <div class="section-title">Category Breakdown</div>
                <div class="section-sub">All time spending by category</div>
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
              <div class="empty-state" style="padding:24px">
                <div class="empty-sub">No data available</div>
              </div>
            }
          </div>

          <!-- Stats summary -->
          <div class="card">
            <div class="section-header">
              <div class="section-title">All-Time Stats</div>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Total Submitted</span>
              <span class="stat-row-val">{{ allExpenses().length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Total Amount</span>
              <span class="stat-row-val">₹{{ totalAmount() | number:'1.0-0' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Total Approved</span>
              <span class="stat-row-val" style="color:var(--success)">₹{{ totalApproved() | number:'1.0-0' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Approval Rate</span>
              <span class="stat-row-val" style="color:var(--accent2)">{{ approvalRate() }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Avg. Expense</span>
              <span class="stat-row-val">₹{{ avgExpense() | number:'1.0-0' }}</span>
            </div>
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

    .month-bars { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .month-bar-item {
      display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--text3);
    }
    .month-bar-fill {
      height: 4px; border-radius: 2px; min-width: 4px;
      transition: width 0.8s ease;
    }

    .stat-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
    }
    .stat-row-label { font-size: 13px; color: var(--text2); }
    .stat-row-val   { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  `],
})
export class EmployeeReportComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);

  allExpenses  = computed(() => this.expSvc.forUser(this.auth.currentUser()?.id || ''));
  monthlies    = computed(() => this.expSvc.monthlySummaries(this.allExpenses()).slice(0, 3));
  categories   = computed(() => this.expSvc.categoryBreakdown(this.allExpenses()));
  totalAmount  = computed(() => this.allExpenses().reduce((s, e) => s + e.amount, 0));
  totalApproved = computed(() => this.allExpenses().filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0));
  avgExpense   = computed(() => this.allExpenses().length ? this.totalAmount() / this.allExpenses().length : 0);
  approvalRate = computed(() => {
    const reviewed = this.allExpenses().filter(e => e.status !== 'Pending');
    if (!reviewed.length) return 0;
    return Math.round(reviewed.filter(e => e.status === 'Approved').length / reviewed.length * 100);
  });
}
