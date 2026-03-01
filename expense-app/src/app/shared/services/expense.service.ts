import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense, ExpenseStatus, MonthlySummary, CategoryBreakdown } from '../models/expense.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private _expenses = signal<Expense[]>([]);

  readonly expenses     = this._expenses.asReadonly();
  readonly allExpenses  = computed(() => this._expenses());
  readonly pendingCount = computed(() => this._expenses().filter(e => e.status === 'Pending').length);

  constructor() { 
    // Don't load data in constructor - let components load when needed
  }

  // ── CRUD ──────────────────────────────────────────
  async submit(exp: Omit<Expense, 'id' | 'submittedAt' | 'reviewedAt' | 'reviewNote' | 'status'>): Promise<Expense> {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/Expenses`, {
          title: exp.title,
          category: exp.category,
          amount: exp.amount,
          date: exp.date,
          description: exp.description,
          receiptName: exp.receiptName,
          receiptData: exp.receiptData
        })
      );

      if (response.success && response.data) {
        const newExp = this.mapFromApi(response.data);
        this._expenses.update(list => [newExp, ...list]);
        return newExp;
      }
      throw new Error('Failed to submit expense');
    } catch (error) {
      console.error('Submit expense error:', error);
      throw error;
    }
  }

  async review(id: string, status: Exclude<ExpenseStatus, 'Pending'>, note = ''): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/Approvals/${id}/review`, {
          status,
          reviewNote: note
        })
      );

      this._expenses.update(list =>
        list.map(e => e.id === id
          ? { ...e, status, reviewNote: note, reviewedAt: new Date().toISOString() }
          : e)
      );
    } catch (error) {
      console.error('Review expense error:', error);
      throw error;
    }
  }

  // ── Queries ───────────────────────────────────────
  async loadUserExpenses(): Promise<void> {
    try {
      const token = localStorage.getItem('ef_token');
      if (!token) {
        console.log('No token found, skipping expense load');
        return;
      }

      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/Expenses/my-expenses`)
      );

      if (response.success && response.data) {
        this._expenses.set(response.data.map((e: any) => this.mapFromApi(e)));
      }
    } catch (error: any) {
      console.error('Load expenses error:', error);
      if (error.status === 401) {
        console.log('Unauthorized - token may be invalid');
        localStorage.removeItem('ef_token');
        localStorage.removeItem('ef_session');
      }
    }
  }

  async loadAllExpenses(): Promise<void> {
    try {
      const token = localStorage.getItem('ef_token');
      if (!token) {
        console.log('No token found, skipping expense load');
        return;
      }

      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/Approvals/all`)
      );

      if (response.success && response.data) {
        this._expenses.set(response.data.map((e: any) => this.mapFromApi(e)));
      }
    } catch (error: any) {
      console.error('Load all expenses error:', error);
      if (error.status === 401) {
        console.log('Unauthorized - token may be invalid');
      }
    }
  }

  async loadPendingExpenses(): Promise<void> {
    try {
      const token = localStorage.getItem('ef_token');
      if (!token) {
        console.log('No token found, skipping expense load');
        return;
      }

      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/Approvals/pending`)
      );

      if (response.success && response.data) {
        this._expenses.set(response.data.map((e: any) => this.mapFromApi(e)));
      }
    } catch (error: any) {
      console.error('Load pending expenses error:', error);
      if (error.status === 401) {
        console.log('Unauthorized - token may be invalid');
      }
    }
  }

  forUser(userId: string): Expense[] {
    return this._expenses().filter(e => e.userId === userId);
  }

  byStatus(status: ExpenseStatus): Expense[] {
    return this._expenses().filter(e => e.status === status);
  }

  // ── Analytics ─────────────────────────────────────
  monthlySummaries(expenses: Expense[]): MonthlySummary[] {
    const map = new Map<string, MonthlySummary>();
    expenses.forEach(e => {
      const d   = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          month: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          year: d.getFullYear(), monthIndex: d.getMonth(),
          total: 0, approved: 0, pending: 0, rejected: 0, count: 0,
        });
      }
      const s = map.get(key)!;
      s.total    += e.amount;
      s.count++;
      if (e.status === 'Approved') s.approved += e.amount;
      if (e.status === 'Pending')  s.pending  += e.amount;
      if (e.status === 'Rejected') s.rejected += e.amount;
    });
    return Array.from(map.values())
      .sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);
  }

  categoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
    const CATEGORY_COLORS: Record<string, string> = {
      'Travel':               '#38bdf8',
      'Food & Dining':        '#6ee7b7',
      'Accommodation':        '#f59e0b',
      'Office Supplies':      '#f87171',
      'Software/Tools':       '#a78bfa',
      'Training':             '#fb923c',
      'Client Entertainment': '#34d399',
      'Other':                '#94a3b8',
    };

    const map = new Map<string, { amount: number; count: number }>();
    expenses.forEach(e => {
      const cur = map.get(e.category) || { amount: 0, count: 0 };
      map.set(e.category, { amount: cur.amount + e.amount, count: cur.count + 1 });
    });
    const total = expenses.reduce((s, e) => s + e.amount, 0) || 1;
    return Array.from(map.entries())
      .map(([category, { amount, count }]) => ({
        category, amount, count,
        percent: Math.round(amount / total * 100),
        color: CATEGORY_COLORS[category] || '#94a3b8',
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  thisMonthExpenses(expenses: Expense[]): Expense[] {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  private mapFromApi(data: any): Expense {
    return {
      id: data.id,
      userId: data.userId,
      userName: data.userName,
      userDept: data.userDept,
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: data.date,
      description: data.description,
      status: data.status as ExpenseStatus,
      receiptName: data.receiptName,
      receiptData: data.receiptData,
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      reviewNote: data.reviewNote
    };
  }
}
