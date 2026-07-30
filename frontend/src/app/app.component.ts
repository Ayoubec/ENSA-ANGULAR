import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { ToastService } from './core/state.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main><router-outlet /></main>
    <app-footer />
    <div class="toasts">
      @for (message of toast.messages(); track message.id) {
        <div class="toast" [class.error]="message.type === 'error'">{{ message.type === 'success' ? '✓' : '!' }} {{ message.text }}</div>
      }
    </div>
  `
})
export class AppComponent { toast = inject(ToastService); }
