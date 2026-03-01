import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const employeeGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isEmployee()) return true;
  if (auth.isManager())  { router.navigate(['/manager/overview']); return false; }
  router.navigate(['/login']);
  return false;
};

export const managerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isManager())  return true;
  if (auth.isEmployee()) { router.navigate(['/employee/overview']); return false; }
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  const route = auth.isEmployee() ? '/employee/overview' : '/manager/overview';
  router.navigate([route]);
  return false;
};
