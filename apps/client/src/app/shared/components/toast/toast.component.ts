import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="min-w-[300px] rounded-lg border p-4 shadow-lg transition-all duration-300"
        [ngClass]="{
          'bg-green-50 border-green-500 text-green-800': toast.type === 'success',
          'bg-red-50 border-red-500 text-red-800': toast.type === 'error',
          'bg-blue-50 border-blue-500 text-blue-800': toast.type === 'info',
        }"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium">{{ toast.message }}</p>
          <button
            (click)="toastService.remove(toast.id)"
            class="ml-4 text-gray-400 hover:text-gray-600"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
