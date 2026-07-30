import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, CartService } from '../core/state.services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="container nav">
        <a routerLink="/" class="logo" (click)="open.set(false)">ENSAGULAR</a>
        <button class="menu-toggle" (click)="open.set(!open())" aria-label="Ouvrir le menu">☰</button>
        <nav [class.open]="open()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="open.set(false)">Accueil</a>
          <a routerLink="/produits" routerLinkActive="active" (click)="open.set(false)">La collection</a>
          @if (auth.user()) {
            <a routerLink="/commandes" routerLinkActive="active" (click)="open.set(false)">Mes commandes</a>
            @if (auth.isAdmin()) { <a routerLink="/admin" routerLinkActive="active" (click)="open.set(false)">Administration</a> }
          }
        </nav>
        <div class="nav-actions">
          @if (auth.user()) {
            <a routerLink="/profil" class="profile-link" aria-label="Profil">{{ initials() }}</a>
          } @else {
            <a routerLink="/connexion" class="login-link">Connexion</a>
          }
          <a routerLink="/panier" class="cart-link" aria-label="Panier">Panier <span>{{ cart.count() }}</span></a>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService); cart = inject(CartService); open = signal(false);
  initials() { return this.auth.user()?.name.split(' ').map(v => v[0]).join('').slice(0, 2).toUpperCase() || ''; }
}
