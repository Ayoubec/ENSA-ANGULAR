import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService, CartService, ToastService } from '../core/state.services';

@Component({
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="container page-space">
      <div class="page-title row"><div><span class="kicker">Votre sélection</span><h1>Mon panier <sup>{{ cart.count() }}</sup></h1></div>@if (cart.items().length) { <button class="clear-cart" (click)="clear()">Vider le panier</button> }</div>
      @if (!cart.items().length) {
        <div class="empty-state"><div>◇</div><h2>Votre panier est encore vide</h2><p>Découvrez notre collection d'essentiels.</p><a routerLink="/produits" class="button">Voir la collection →</a></div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.items(); track item.product.id) {
              <article class="cart-item">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" loading="lazy" decoding="async">
                <div class="cart-item-copy"><span class="eyebrow">{{ item.product.category }}</span><h3>{{ item.product.name }}</h3><small>{{ item.product.stock }} disponible(s)</small><button class="remove" (click)="cart.remove(item.product.id)">Supprimer</button></div>
                <div class="quantity"><button (click)="cart.quantity(item.product.id, item.quantity - 1)" aria-label="Diminuer la quantité">−</button><span>{{ item.quantity }}</span><button (click)="cart.quantity(item.product.id, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock" aria-label="Augmenter la quantité">+</button></div>
                <strong>{{ item.product.price * item.quantity | currency:'MAD':'Dh':'1.2-2':'fr' }}</strong>
              </article>
            }
          </div>
          <aside class="summary"><h2>Récapitulatif</h2><div><span>Sous-total</span><b>{{ cart.total() | currency:'MAD':'Dh':'1.2-2':'fr' }}</b></div><div><span>Livraison</span><b>{{ deliveryFee() === 0 ? 'Offerte' : (deliveryFee() | currency:'MAD':'Dh':'1.2-2':'fr') }}</b></div><div class="summary-total"><span>Total à payer</span><b>{{ cart.total() + deliveryFee() | currency:'MAD':'Dh':'1.2-2':'fr' }}</b></div><div class="payment-info"><b>Paiement à la livraison</b><span>Vous paierez le montant total au livreur lors de la réception de votre commande.</span></div><button class="button full" (click)="checkout()" [disabled]="loading">{{ loading ? 'Envoi de la commande…' : 'Commander' }}</button><a routerLink="/produits" class="continue-link">← Continuer mes achats</a></aside>
        </div>
      }
    </section>
  `
})
export class CartComponent {
  cart = inject(CartService); private api = inject(ApiService); private auth = inject(AuthService); private router = inject(Router); private toast = inject(ToastService); loading = false;
  deliveryFee() { return this.cart.total() >= 500 ? 0 : 30; }
  clear() { if (confirm('Voulez-vous vider votre panier ?')) { this.cart.clear(); this.toast.show('Panier vidé'); } }
  checkout() {
    if (!this.auth.user()) { this.toast.show('Connectez-vous pour commander', 'error'); this.router.navigate(['/connexion']); return; }
    this.loading = true;
    this.api.checkout(this.cart.items().map(i => ({ productId: i.product.id, quantity: i.quantity }))).subscribe({
      next: () => { this.cart.clear(); this.toast.show('Commande enregistrée. Paiement à la livraison.'); this.router.navigate(['/commandes']); },
      error: e => { this.loading = false; this.toast.show(e.error?.message || 'Commande impossible', 'error'); }
    });
  }
}
