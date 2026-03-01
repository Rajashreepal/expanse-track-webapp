import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseService } from '../../shared/services/expense.service';
import { Expense } from '../../shared/models/expense.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">My Expenses</h1>
          <p class="topbar-sub">{{ filtered().length }} expense(s) found</p>
        </div>
      </header>

      <div class="content">
        <!-- Filters -->
        <div class="filter-bar">
          <input class="filter-input" type="text" [(ngModel)]="search"
            placeholder="🔍  Search by title or category…">
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
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (exp of filtered(); track exp.id; let i = $index) {
                <tr>
                  <td class="mono" style="color:var(--text3)">#{{ (i+1).toString().padStart(3,'0') }}</td>
                  <td>
                    <div style="font-weight:600">{{ exp.title }}</div>
                    @if (exp.description) {
                      <div style="font-size:11px;color:var(--text3);margin-top:2px">
                        {{ exp.description | slice:0:50 }}{{ exp.description.length > 50 ? '…' : '' }}
                      </div>
                    }
                  </td>
                  <td style="color:var(--text2)">{{ exp.category }}</td>
                  <td class="mono">₹{{ exp.amount | number:'1.0-0' }}</td>
                  <td style="color:var(--text2)">{{ exp.date }}</td>
                  <td>
                    <span class="badge" [class]="'badge-' + exp.status.toLowerCase()">
                      {{ exp.status }}
                    </span>
                  </td>
                  <td>
                    @if (exp.receiptName) {
                      <span style="color:var(--accent);font-size:12px">📎 {{ exp.receiptName }}</span>
                    } @else {
                      <span style="color:var(--text3);font-size:12px">—</span>
                    }
                  </td>
                  <td>
                    <button class="tbl-btn view" (click)="selectExpense(exp)">View</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (filtered().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <div class="empty-title">No expenses found</div>
              <div class="empty-sub">Try adjusting your filters or submit a new expense</div>
            </div>
          }
        </div>
      </div>

      <!-- Detail panel -->
      @if (selected()) {
        <div class="detail-overlay" (click)="selected.set(null)">
          <div class="detail-panel" (click)="$event.stopPropagation()">
            <div class="detail-header">
              <div>
                <h2 class="detail-title">{{ selected()!.title }}</h2>
                <span class="badge" [class]="'badge-' + selected()!.status.toLowerCase()">{{ selected()!.status }}</span>
              </div>
              <button class="detail-close" (click)="selected.set(null)">✕</button>
            </div>

            <div class="detail-body">
              <div class="detail-grid">
                <div class="detail-field">
                  <div class="detail-field-label">Amount</div>
                  <div class="detail-field-val" style="font-family:'JetBrains Mono',monospace;font-size:22px;color:var(--accent2)">
                    ₹{{ selected()!.amount | number:'1.0-0' }}
                  </div>
                </div>
                <div class="detail-field">
                  <div class="detail-field-label">Category</div>
                  <div class="detail-field-val">{{ selected()!.category }}</div>
                </div>
                <div class="detail-field">
                  <div class="detail-field-label">Date</div>
                  <div class="detail-field-val">{{ selected()!.date }}</div>
                </div>
                <div class="detail-field">
                  <div class="detail-field-label">Submitted</div>
                  <div class="detail-field-val">{{ selected()!.submittedAt | date:'dd MMM yyyy, HH:mm' }}</div>
                </div>
                @if (selected()!.description) {
                  <div class="detail-field" style="grid-column:span 2">
                    <div class="detail-field-label">Description</div>
                    <div class="detail-field-val" style="color:var(--text2)">{{ selected()!.description }}</div>
                  </div>
                }
                @if (selected()!.receiptName) {
                  <div class="detail-field">
                    <div class="detail-field-label">Receipt</div>
                    <div class="detail-field-val" style="color:var(--accent)">📎 {{ selected()!.receiptName }}</div>
                  </div>
                }
              </div>

              @if (selected()!.reviewNote) {
                <div class="review-note" [class.note-approved]="selected()!.status==='Approved'" [class.note-rejected]="selected()!.status==='Rejected'">
                  <div class="note-label">Manager Note</div>
                  <div class="note-text">{{ selected()!.reviewNote }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrap { display: flex; flex-direction: column; min-height: 100vh; position: relative; }
    .topbar {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 18px 32px; display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-title { font-size: 18px; font-weight: 700; }
    .topbar-sub   { font-size: 13px; color: var(--text2); margin-top: 2px; }
    .content { padding: 28px 32px; flex: 1; }

    /* Detail overlay */
    .detail-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px); z-index: 200;
      display: flex; align-items: center; justify-content: center;
    }
    .detail-panel {
      background: var(--surface); border: 1px solid var(--border2);
      border-radius: 16px; width: 90%; max-width: 520px;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    .detail-header {
      padding: 22px 26px 0;
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 20px;
    }
    .detail-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .detail-close {
      width: 30px; height: 30px; border-radius: 8px;
      background: var(--surface2); border: none; color: var(--text2);
      cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 4px;
      &:hover { background: var(--surface3); color: var(--text); }
    }
    .detail-body { padding: 0 26px 26px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
    .detail-field-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .detail-field-val   { font-size: 14px; font-weight: 500; }

    .review-note {
      padding: 14px 16px; border-radius: var(--radius-sm); border-left: 3px solid;
      .note-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; font-weight: 600; }
      .note-text  { font-size: 13px; }
      &.note-approved { background: rgba(110,231,183,0.08); border-color: var(--success); .note-label { color: var(--success); } }
      &.note-rejected { background: rgba(248,113,113,0.08); border-color: var(--danger);  .note-label { color: var(--danger);  } }
    }
  `],
})
export class ExpenseListComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);

  search         = '';
  statusFilter   = '';
  categoryFilter = '';
  selected       = signal<Expense | null>(null);

  private myExpenses = computed(() => this.expSvc.forUser(this.auth.currentUser()?.id || ''));

  filtered = computed(() => {
    const s = this.search.toLowerCase();
    return this.myExpenses().filter(e =>
      (e.title.toLowerCase().includes(s) || e.category.toLowerCase().includes(s)) &&
      (!this.statusFilter   || e.status === this.statusFilter) &&
      (!this.categoryFilter || e.category === this.categoryFilter)
    );
  });

  selectExpense(exp: Expense): void { this.selected.set(exp); }
}
