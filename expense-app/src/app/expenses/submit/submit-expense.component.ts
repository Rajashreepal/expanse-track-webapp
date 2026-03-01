import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseService } from '../../shared/services/expense.service';
import { ToastService } from '../../shared/services/toast.service';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../../shared/models/expense.model';

@Component({
  selector: 'app-submit-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap fade-in">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Submit Expense</h1>
          <p class="topbar-sub">Fill in all required fields. Receipts are optional but recommended.</p>
        </div>
      </header>

      <div class="content">
        <div class="form-container">
          <div class="card">
            <form #expForm="ngForm" (ngSubmit)="submitExpense(expForm)" novalidate>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Expense Title *</label>
                  <input class="form-control" name="title" type="text"
                    [(ngModel)]="title" required maxlength="100"
                    #titleRef="ngModel"
                    placeholder="e.g. Client Dinner, AWS Conference">
                  @if (titleRef.invalid && titleRef.touched) {
                    <span class="form-error">Title is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">Amount (₹) *</label>
                  <input class="form-control" name="amount" type="number"
                    [(ngModel)]="amount" required min="1" max="100000"
                    #amtRef="ngModel"
                    placeholder="0.00">
                  @if (amtRef.invalid && amtRef.touched) {
                    <span class="form-error">Enter a valid amount (₹1 – ₹1,00,000).</span>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select class="form-control" name="category"
                    [(ngModel)]="category" required #catRef="ngModel">
                    <option value="">Select category</option>
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                  @if (catRef.invalid && catRef.touched) {
                    <span class="form-error">Please select a category.</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input class="form-control" name="date" type="date"
                    [(ngModel)]="date" required [max]="today"
                    #dateRef="ngModel">
                  @if (dateRef.invalid && dateRef.touched) {
                    <span class="form-error">Please select a valid date (not future).</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description"
                  [(ngModel)]="description" rows="3"
                  placeholder="Provide additional context, purpose, or attendees (optional)…"></textarea>
              </div>

              <!-- Upload zone -->
              <div class="form-group">
                <label class="form-label">Receipt (Optional)</label>
                <div class="upload-zone" [class.has-file]="receiptName()" (click)="fileInput.click()">
                  @if (!receiptName()) {
                    <div class="upload-icon">📎</div>
                    <div class="upload-text"><strong>Click to upload</strong> or drag & drop</div>
                    <div class="upload-hint">PNG, JPG, PDF — max 5MB</div>
                  } @else {
                    <div class="upload-icon">✅</div>
                    <div class="upload-text" style="color:var(--accent)"><strong>{{ receiptName() }}</strong></div>
                    <div class="upload-hint">Click to change</div>
                  }
                </div>
                <input #fileInput type="file" hidden accept=".png,.jpg,.jpeg,.pdf"
                  (change)="handleFile($event)">
              </div>

              <!-- Validation rules callout -->
              <div class="rules-box">
                <div class="rules-title">📋 Expense Policy Reminders</div>
                <ul class="rules-list">
                  <li>Maximum single expense: <strong>₹1,00,000</strong></li>
                  <li>Expenses above ₹10,000 require manager justification</li>
                  <li>Client entertainment requires a receipt</li>
                  <li>Future-dated expenses are not accepted</li>
                </ul>
              </div>

              <div class="form-actions">
                <button class="btn btn-primary btn-lg" type="submit" [disabled]="loading()">
                  {{ loading() ? 'Submitting…' : '↑ Submit Expense' }}
                </button>
                <button class="btn btn-outline" type="button" (click)="clearForm(expForm)">
                  Clear Form
                </button>
              </div>
            </form>
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
    .form-container { max-width: 680px; }

    .rules-box {
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 16px 20px; margin-bottom: 24px;
    }
    .rules-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
    .rules-list  {
      list-style: none; display: flex; flex-direction: column; gap: 6px;
      li { font-size: 12px; color: var(--text2); padding-left: 14px; position: relative;
        &::before { content: '→'; position: absolute; left: 0; color: var(--accent3); } }
    }

    .form-actions { display: flex; gap: 12px; align-items: center; }
  `],
})
export class SubmitExpenseComponent {
  auth    = inject(AuthService);
  expSvc  = inject(ExpenseService);
  toast   = inject(ToastService);
  router  = inject(Router);

  categories = EXPENSE_CATEGORIES;
  today = new Date().toISOString().split('T')[0];

  title       = '';
  amount: number | null = null;
  category: ExpenseCategory | '' = '';
  date        = this.today;
  description = '';
  receiptName = signal<string | null>(null);
  receiptData = signal<string | null>(null);
  loading     = signal(false);

  handleFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { this.toast.error('File exceeds 5MB limit.'); return; }
    this.receiptName.set(file.name);
    const reader = new FileReader();
    reader.onload = (e) => this.receiptData.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  submitExpense(form: NgForm): void {
    form.control.markAllAsTouched();
    if (form.invalid) return;

    // Validation rules
    if (this.amount! > 100000) { this.toast.error('Amount exceeds ₹1,00,000 limit.'); return; }
    if (this.amount! < 1)      { this.toast.error('Amount must be at least ₹1.');     return; }
    if (new Date(this.date) > new Date()) { this.toast.error('Date cannot be in the future.'); return; }
    if (this.category === 'Client Entertainment' && !this.receiptName()) {
      this.toast.warning('Receipt is required for Client Entertainment expenses.');
    }

    this.loading.set(true);
    const user = this.auth.currentUser()!;

    this.expSvc.submit({
      userId:      user.id,
      userName:    `${user.fname} ${user.lname}`,
      userDept:    user.department,
      title:       this.title,
      category:    this.category as any,
      amount:      this.amount!,
      date:        this.date,
      description: this.description,
      receiptName: this.receiptName(),
      receiptData: this.receiptData(),
    }).then(() => {
      this.toast.success('Expense submitted successfully! ✅');
      this.loading.set(false);
      this.router.navigate(['/employee/my-expenses']);
    }).catch(error => {
      this.toast.error('Failed to submit expense');
      this.loading.set(false);
    });
  }

  clearForm(form: NgForm): void {
    form.resetForm();
    this.title = ''; this.amount = null; this.category = '';
    this.date = this.today; this.description = '';
    this.receiptName.set(null); this.receiptData.set(null);
  }
}
