import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { CartService, ToastService } from '../core/state.services';

@Component({
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    @if (product(); as p) {
      <section class="container detail">
        <div class="detail-image"><img [src]="p.imageUrl" [alt]="p.name" loading="eager" fetchpriority="high"></div>
        <div class="detail-copy">
          <a routerLink="/produits" class="back-link">← Retour à la collection</a>
          <span class="kicker">{{ p.category }}</span><h1>{{ p.name }}</h1>
          <div class="detail-price">{{ p.price | currency:'MAD':'Dh':'1.2-2':'fr' }}</div>
          <p>{{ p.description }}</p>
          <div class="stock"><i></i>{{ p.stock > 0 ? 'En stock — expédié sous 48h' : 'Rupture de stock' }}</div>
          <button class="button full" [disabled]="p.stock === 0" (click)="add(p)">Ajouter au panier <span>+</span></button>
          <div class="detail-notes"><div><strong>↗</strong><span><b>Livraison offerte</b><small>À partir de 500 Dh d'achat</small></span></div><div><strong>↺</strong><span><b>Retours faciles</b><small>Sous 30 jours</small></span></div></div>
        </div>
      </section>
    } @else { <div class="empty page-space">Chargement…</div> }
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private api = inject(ApiService); private cart = inject(CartService); private toast = inject(ToastService);
  product = signal<Product | null>(null);
  ngOnInit() { this.api.product(Number(this.route.snapshot.paramMap.get('id'))).subscribe(p => this.product.set(p)); }
  add(product: Product) { this.cart.add(product); this.toast.show('Produit ajouté au panier'); }
}
