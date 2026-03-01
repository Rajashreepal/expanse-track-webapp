import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../shared/services/expense.service';

@Component({
  selector: 'app-all-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">All Expenses</h1>
          <p class="topbar-sub">{{ filtered().length }} expense(s) shown</p>
        </div>
      </header>

      <div class="content">
        <div class="filter-bar">
          <input class="filter-input" type="text" [(ngModel)]="search"
            placeholder="🔍  Search by employee, title, or category…">
          <select class="filter-select" [(ngModel)]="statusFilter">
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <select class="filter-select" [(ngModel)]="categoryFilter">
            <option value="">All Categories</option>
            <option>Travel</option>
            <option>Food & Dining</option>
            <option>Accommodation</option>
            <option>Office Supplies</option>
            <option>Software/Tools</option>
            <option>Training</option>
            <option>Client Entertainment</option>
            <option>Other</option>
          </select>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Reviewed</th>
              </tr>
            </thead>
            <tbody>
              @for (exp of filtered(); track exp.id) {
                <tr>
                  <td>
                    <div style="font-weight:600">{{ exp.userName }}</div>
                    <div style="font-size:11px;color:var(--text3)">{{ exp.userDept }}</div>
                  </td>
                  <td>{{ exp.title }}</td>
                  <td style="color:var(--text2)">{{ exp.category }}</td>
                  <td class="mono">₹{{ exp.amount | number:'1.0-0' }}</td>
                  <td style="color:var(--text2)">{{ exp.date }}</td>
                  <td><span class="badge" [class]="'badge-' + exp.status.toLowerCase()">{{ exp.status }}</span></td>
                  <td>
                    @if (exp.receiptName) {
                      <span style="color:var(--accent);font-size:12px">📎 {{ exp.receiptName }}</span>
                    } @else {
                      <span style="color:var(--text3);font-size:12px">—</span>
                    }
                  </td>
                  <td style="color:var(--text3);font-size:12px">
                    @if (exp.reviewedAt) {
                      {{ exp.reviewedAt | date:'dd MMM' }}
                    } @else {
                      —
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (filtered().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <div class="empty-title">No expenses found</div>
              <div class="empty-sub">Try adjusting your search or filter criteria</div>
            </div>
          }
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
  `],
})
export class AllExpensesComponent {
  expSvc = inject(ExpenseService);

  search         = '';
  statusFilter   = '';
  categoryFilter = '';

  filtered = computed(() => {
    const s = this.search.toLowerCase();
    return this.expSvc.allExpenses().filter(e =>
      (e.userName.toLowerCase().includes(s) ||
       e.title.toLowerCase().includes(s) ||
       e.category.toLowerCase().includes(s)) &&
      (!this.statusFilter   || e.status === this.statusFilter) &&
      (!this.categoryFilter || e.category === this.categoryFilter)
    );
  });
}
