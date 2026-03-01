import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../shared/services/expense.service';

@Component({
  selector: 'app-manager-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Monthly Reports</h1>
          <p class="topbar-sub">Team-wide expense analytics and trends</p>
        </div>
      </header>

      <div class="content">
        <!-- Monthly summaries -->
        <div class="grid-3" style="margin-bottom:24px">
          @for (m of monthlies(); track m.month) {
            <div class="summary-card">
              <div class="summary-month">{{ m.month }}</div>
              <div class="summary-amount">₹{{ m.total | number:'1.0-0' }}</div>
              <div class="summary-meta">
                <span>{{ m.count }}</span> expenses submitted
              </div>
              <div class="mini-stats">
                <div class="mini-stat" style="color:var(--success)">✓ ₹{{ m.approved | number:'1.0-0' }}</div>
                <div class="mini-stat" style="color:var(--warning)">⏳ {{ m.pending }}</div>
                <div class="mini-stat" style="color:var(--danger)">✕ {{ m.rejected }}</div>
              </div>
            </div>
          }
        </div>

        <div class="grid-2">
          <!-- Category breakdown -->
          <div class="card">
            <div class="section-header">
              <div>
                <div class="section-title">Team Category Breakdown</div>
                <div class="section-sub">All-time team spending by category</div>
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
          </div>

          <!-- Team stats -->
          <div class="card">
            <div class="section-header">
              <div class="section-title">Team Statistics</div>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Total Submitted</span>
              <span class="stat-row-val">{{ expSvc.allExpenses().length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Total Value</span>
              <span class="stat-row-val">₹{{ totalValue() | number:'1.0-0' }}</span>
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
              <span class="stat-row-label">Avg. Expense Value</span>
              <span class="stat-row-val">₹{{ avgExpense() | number:'1.0-0' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Pending Review</span>
              <span class="stat-row-val" style="color:var(--warning)">{{ expSvc.pendingCount() }}</span>
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

    .mini-stats { display: flex; gap: 14px; margin-top: 14px; font-size: 12px; font-weight: 600; }
    .mini-stat  { font-family: 'JetBrains Mono', monospace; }

    .stat-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
    }
    .stat-row-label { font-size: 13px; color: var(--text2); }
    .stat-row-val   { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  `],
})
export class ManagerReportComponent {
  expSvc = inject(ExpenseService);

  monthlies    = computed(() => this.expSvc.monthlySummaries(this.expSvc.allExpenses()).slice(0, 3));
  categories   = computed(() => this.expSvc.categoryBreakdown(this.expSvc.allExpenses()));
  totalValue   = computed(() => this.expSvc.allExpenses().reduce((s, e) => s + e.amount, 0));
  totalApproved = computed(() => this.expSvc.allExpenses().filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0));
  avgExpense   = computed(() => this.expSvc.allExpenses().length ? this.totalValue() / this.expSvc.allExpenses().length : 0);
  approvalRate = computed(() => {
    const reviewed = this.expSvc.allExpenses().filter(e => e.status !== 'Pending');
    if (!reviewed.length) return 0;
    return Math.round(reviewed.filter(e => e.status === 'Approved').length / reviewed.length * 100);
  });
}
