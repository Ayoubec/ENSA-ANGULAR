import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../core/models';
import { CartService, ToastService } from '../core/state.services';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="product-card">
      <a class="product-image" [routerLink]="['/produits', product().id]">
        <img [src]="product().imageUrl" [alt]="product().name" loading="lazy" decoding="async">
        @if (product().featured) { <span class="tag">Coup de cœur</span> }
      </a>
      <div class="product-copy">
        <div class="eyebrow">{{ product().category }}</div>
        <a [routerLink]="['/produits', product().id]"><h3>{{ product().name }}</h3></a>
        <div class="product-bottom">
          <strong>{{ product().price | currency:'MAD':'Dh':'1.2-2':'fr' }}</strong>
          <button class="icon-button" (click)="add()" aria-label="Ajouter au panier">+</button>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  private cart = inject(CartService);
  private toast = inject(ToastService);
  add() { this.cart.add(this.product()); this.toast.show(`${this.product().name} ajouté au panier`); }
}
