import { Component, inject, computed } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { AuthStore } from '@resttek/web-shared'
import { CartStore } from '../store/cart.store'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="app-layout">
      <header class="header">
        <div class="header-left">
          <a routerLink="/restaurants" class="logo">
            <img src="/assets/images/logo.png" alt="RestTek" class="logo-img">
            <span>RestTek</span>
          </a>
        </div>
        <nav class="nav">
          <a routerLink="/restaurants" routerLinkActive="active" class="nav-link">
            <lucide-icon name="store" [size]="18"></lucide-icon>
            Restaurantes
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-link">
            <lucide-icon name="clipboard-list" [size]="18"></lucide-icon>
            Mis Pedidos
          </a>
        </nav>
        <div class="header-right">
          <a routerLink="/cart" class="cart-btn" routerLinkActive="active">
            <lucide-icon name="shopping-cart" [size]="20"></lucide-icon>
            @if (itemCount() > 0) {
              <span class="badge">{{ itemCount() }}</span>
            }
          </a>
          <div class="user-menu">
            <span class="user-name">{{ userName() }}</span>
            <button class="btn btn-icon" (click)="logout()" title="Cerrar sesión">
              <lucide-icon name="log-out"></lucide-icon>
            </button>
          </div>
        </div>
      </header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 60px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }
    .header-left {
      display: flex;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--green-light);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
    .nav {
      display: flex;
      gap: 8px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-weight: 500;
      transition: all var(--transition);
    }
    .nav-link:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .nav-link.active {
      background: var(--green-glow);
      color: var(--green-light);
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      transition: all var(--transition);
    }
    .cart-btn:hover, .cart-btn.active {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 10px;
      background: var(--green-medium);
      color: var(--bg-primary);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-name {
      color: var(--text-secondary);
      font-size: 14px;
    }
    .btn-icon {
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }
    .btn-icon:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--text-muted);
    }
    .main-content {
      flex: 1;
      padding: 24px;
    }
  `]
})
export class ShellComponent {
  private readonly authStore = inject(AuthStore)
  private readonly cartStore = inject(CartStore)

  readonly userName = computed(() => {
    const user = this.authStore.user()
    return user ? `${user.firstName}` : ''
  })

  readonly itemCount = computed(() => this.cartStore.itemCount())

  logout(): void {
    this.authStore.clearSession()
  }
}
