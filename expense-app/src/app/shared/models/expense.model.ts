export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';
export type UserRole = 'employee' | 'manager';
export type ExpenseCategory =
  | 'Travel'
  | 'Food & Dining'
  | 'Accommodation'
  | 'Office Supplies'
  | 'Software/Tools'
  | 'Training'
  | 'Client Entertainment'
  | 'Other';

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  userDept: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  status: ExpenseStatus;
  receiptName: string | null;
  receiptData: string | null;   // base64 or null
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string;
}

export interface MonthlySummary {
  month: string;          // e.g. "February 2025"
  year: number;
  monthIndex: number;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percent: number;
  color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Travel',
  'Food & Dining',
  'Accommodation',
  'Office Supplies',
  'Software/Tools',
  'Training',
  'Client Entertainment',
  'Other',
];

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Product',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Travel':               '#38bdf8',
  'Food & Dining':        '#6ee7b7',
  'Accommodation':        '#f59e0b',
  'Office Supplies':      '#f87171',
  'Software/Tools':       '#a78bfa',
  'Training':             '#fb923c',
  'Client Entertainment': '#34d399',
  'Other':                '#94a3b8',
};
