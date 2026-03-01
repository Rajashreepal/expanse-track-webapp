import { Routes } from '@angular/router';
import { authGuard, employeeGuard, managerGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
  },

  // Employee shell
  {
    path: 'employee',
    canActivate: [authGuard, employeeGuard],
    loadComponent: () => import('./dashboard/employee/employee-shell.component').then(m => m.EmployeeShellComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./dashboard/employee/overview/emp-overview.component').then(m => m.EmpOverviewComponent),
      },
      {
        path: 'submit',
        loadComponent: () => import('./expenses/submit/submit-expense.component').then(m => m.SubmitExpenseComponent),
      },
      {
        path: 'my-expenses',
        loadComponent: () => import('./expenses/list/expense-list.component').then(m => m.ExpenseListComponent),
      },
      {
        path: 'summary',
        loadComponent: () => import('./reports/employee-report/employee-report.component').then(m => m.EmployeeReportComponent),
      },
    ],
  },

  // Manager shell
  {
    path: 'manager',
    canActivate: [authGuard, managerGuard],
    loadComponent: () => import('./dashboard/manager/manager-shell.component').then(m => m.ManagerShellComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./dashboard/manager/overview/mgr-overview.component').then(m => m.MgrOverviewComponent),
      },
      {
        path: 'pending',
        loadComponent: () => import('./approvals/pending/pending-approvals.component').then(m => m.PendingApprovalsComponent),
      },
      {
        path: 'all-expenses',
        loadComponent: () => import('./approvals/all/all-expenses.component').then(m => m.AllExpensesComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/manager-report/manager-report.component').then(m => m.ManagerReportComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
