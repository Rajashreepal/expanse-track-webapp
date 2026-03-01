import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      min-width: 280px;
      max-width: 400px;
      cursor: pointer;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border-left-width: 3px;
    }
    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast-success { border-left-color: var(--success); }
    .toast-error   { border-left-color: var(--danger);  }
    .toast-info    { border-left-color: var(--accent2); }
    .toast-warning { border-left-color: var(--warning); }
    .toast-icon { font-size: 18px; flex-shrink: 0; }
    .toast-msg  { flex: 1; line-height: 1.4; }
    .toast-close {
      background: none;
      border: none;
      color: var(--text3);
      cursor: pointer;
      font-size: 13px;
      flex-shrink: 0;
      &:hover { color: var(--text2); }
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);
  icons: Record<string, string> = {
    success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
  };
}
