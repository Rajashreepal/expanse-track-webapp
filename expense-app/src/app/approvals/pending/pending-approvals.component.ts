import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../shared/services/expense.service';
import { ToastService } from '../../shared/services/toast.service';
import { Expense } from '../../shared/models/expense.model';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Pending Approvals</h1>
          <p class="topbar-sub">{{ pending().length }} expense(s) awaiting your review</p>
        </div>
      </header>

      <div class="content">
        @if (pending().length === 0) {
          <div class="empty-state" style="padding:80px">
            <div class="empty-icon">🎉</div>
            <div class="empty-title">You're all caught up!</div>
            <div class="empty-sub">No pending expenses to review at the moment</div>
          </div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (exp of pending(); track exp.id) {
                  <tr>
                    <td>
                      <div style="font-weight:600">{{ exp.userName }}</div>
                      <div style="font-size:11px;color:var(--text3)">{{ exp.userDept }}</div>
                    </td>
                    <td>
                      <div style="font-weight:600">{{ exp.title }}</div>
                      @if (exp.description) {
                        <div style="font-size:11px;color:var(--text3)">{{ exp.description | slice:0:40 }}…</div>
                      }
                    </td>
                    <td style="color:var(--text2)">{{ exp.category }}</td>
                    <td>
                      <span class="mono" [class.high-amount]="exp.amount > 10000">
                        ₹{{ exp.amount | number:'1.0-0' }}
                      </span>
                      @if (exp.amount > 10000) {
                        <div class="high-amount-tag">High value</div>
                      }
                    </td>
                    <td style="color:var(--text2)">{{ exp.date }}</td>
                    <td>
                      @if (exp.receiptName) {
                        <span style="color:var(--accent);font-size:12px">📎 Yes</span>
                      } @else {
                        <span style="color:var(--text3);font-size:12px">None</span>
                      }
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="tbl-btn approve" (click)="quickApprove(exp.id)">✓ Approve</button>
                        <button class="tbl-btn reject"  (click)="quickReject(exp.id)">✕ Reject</button>
                        <button class="tbl-btn view"    (click)="openReview(exp)">Review</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Review modal -->
      @if (reviewing()) {
        <div class="modal-overlay" (click)="reviewing.set(null)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Review Expense</h2>
              <button class="modal-close" (click)="reviewing.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <!-- Expense detail -->
              <div class="review-detail">
                <div class="review-grid">
                  <div class="rv-field">
                    <div class="rv-label">Employee</div>
                    <div class="rv-val" style="font-weight:600">{{ reviewing()!.userName }}</div>
                    <div style="font-size:11px;color:var(--text3)">{{ reviewing()!.userDept }}</div>
                  </div>
                  <div class="rv-field">
                    <div class="rv-label">Amount</div>
                    <div class="rv-val mono" style="font-size:22px;color:var(--accent2)">
                      ₹{{ reviewing()!.amount | number:'1.0-0' }}
                    </div>
                    @if (reviewing()!.amount > 10000) {
                      <div class="high-amount-tag">High value — verify policy</div>
                    }
                  </div>
                  <div class="rv-field">
                    <div class="rv-label">Category</div>
                    <div class="rv-val">{{ reviewing()!.category }}</div>
                  </div>
                  <div class="rv-field">
                    <div class="rv-label">Date</div>
                    <div class="rv-val">{{ reviewing()!.date }}</div>
                  </div>
                  @if (reviewing()!.description) {
                    <div class="rv-field" style="grid-column:span 2">
                      <div class="rv-label">Description</div>
                      <div class="rv-val" style="color:var(--text2)">{{ reviewing()!.description }}</div>
                    </div>
                  }
                  @if (reviewing()!.receiptName) {
                    <div class="rv-field">
                      <div class="rv-label">Receipt</div>
                      <div style="color:var(--accent);font-size:13px">📎 {{ reviewing()!.receiptName }}</div>
                    </div>
                  }
                </div>
              </div>

              <div class="form-group" style="margin-top:16px">
                <label class="form-label">Review Note (optional — visible to employee)</label>
                <textarea class="form-control" [(ngModel)]="reviewNote" rows="3"
                  placeholder="Add context for the employee…"></textarea>
              </div>

              <div class="modal-actions">
                <button class="btn btn-success" (click)="submitReview('Approved')">✓ Approve Expense</button>
                <button class="btn btn-danger"  (click)="submitReview('Rejected')">✕ Reject Expense</button>
                <button class="btn btn-outline" (click)="reviewing.set(null)">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      }
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

    .high-amount { color: var(--warning) !important; }
    .high-amount-tag { font-size: 10px; color: var(--warning); margin-top: 2px; background: rgba(245,158,11,0.1); padding: 1px 6px; border-radius: 4px; display: inline-block; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px); z-index: 200;
      display: flex; align-items: center; justify-content: center;
    }
    .modal {
      background: var(--surface); border: 1px solid var(--border2);
      border-radius: 16px; width: 90%; max-width: 560px;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      padding: 22px 26px 0;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal-title { font-size: 18px; font-weight: 700; }
    .modal-close {
      width: 30px; height: 30px; border-radius: 8px;
      background: var(--surface2); border: none; color: var(--text2);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      &:hover { background: var(--surface3); color: var(--text); }
    }
    .modal-body { padding: 0 26px 26px; }

    .review-detail { background: var(--surface2); border-radius: var(--radius); padding: 20px; }
    .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .rv-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .rv-val   { font-size: 14px; font-weight: 500; }

    .modal-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
  `],
})
export class PendingApprovalsComponent {
  expSvc  = inject(ExpenseService);
  toast   = inject(ToastService);

  pending    = computed(() => this.expSvc.byStatus('Pending'));
  reviewing  = signal<Expense | null>(null);
  reviewNote = '';

  openReview(exp: Expense): void {
    this.reviewing.set(exp);
    this.reviewNote = '';
  }

  quickApprove(id: string): void {
    this.expSvc.review(id, 'Approved').then(() => {
      this.toast.success('Expense approved ✅');
    }).catch(() => {
      this.toast.error('Failed to approve expense');
    });
  }

  quickReject(id: string): void {
    this.expSvc.review(id, 'Rejected', 'Rejected by manager.').then(() => {
      this.toast.error('Expense rejected.');
    }).catch(() => {
      this.toast.error('Failed to reject expense');
    });
  }

  submitReview(status: 'Approved' | 'Rejected'): void {
    const exp = this.reviewing();
    if (!exp) return;
    this.expSvc.review(exp.id, status, this.reviewNote).then(() => {
      this.reviewing.set(null);
      this.toast[status === 'Approved' ? 'success' : 'error'](
        `Expense ${status === 'Approved' ? 'approved ✅' : 'rejected'}.`
      );
    }).catch(() => {
      this.toast.error('Failed to review expense');
    });
  }
}
