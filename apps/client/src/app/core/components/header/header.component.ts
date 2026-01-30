import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm mb-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="flex items-center"> <b>Claims Management System</b> </a>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {}
