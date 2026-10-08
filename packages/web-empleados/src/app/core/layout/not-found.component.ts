import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <a routerLink="/" class="btn btn-primary">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    .not-found h1 {
      font-size: 72px;
      font-weight: 700;
      color: var(--green-light);
    }
    .not-found p {
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
  `]
})
export class NotFoundComponent {}
