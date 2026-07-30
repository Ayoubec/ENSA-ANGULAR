import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="kicker">Bienvenue sur ENSAGULAR</span>
          <h1>Des produits utiles pour votre quotidien</h1>
          <p>Découvrez notre sélection de produits pour la maison, la cuisine, le bien-être et la papeterie.</p>
          <div class="hero-actions"><a routerLink="/produits" class="button">Voir les produits</a></div>
        </div>
        <div class="hero-visual">
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85" alt="Intérieur minimaliste chaleureux" loading="eager" fetchpriority="high">
        </div>
      </div>
    </section>
    <section class="trust-bar"><div class="container"><span>Livraison partout au Maroc</span><span>Offerte dès 500 Dh</span><span>Paiement à la livraison</span></div></section>
    <section class="section container">
      <div class="section-head"><div><h2>Produits populaires</h2><p>Une sélection de produits appréciés par nos clients.</p></div><a routerLink="/produits" class="text-link">Voir tous les produits</a></div>
      <div class="product-grid">
        @for (product of featured(); track product.id) { <app-product-card [product]="product" /> }
      </div>
    </section>
    <section class="philosophy" id="philosophie">
      <div class="container philosophy-grid">
        <div class="philosophy-image"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85" alt="Mobilier artisanal" loading="lazy" decoding="async"></div>
        <div class="philosophy-copy"><h2>À propos d'ENSAGULAR</h2><p>ENSAGULAR est une boutique de démonstration réalisée dans le cadre d'un projet universitaire. Elle propose une sélection simple de produits du quotidien et permet de tester toutes les étapes d'un achat en ligne.</p><a routerLink="/produits" class="button">Découvrir le catalogue</a></div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService); featured = signal<Product[]>([]);
  ngOnInit() { this.api.products().subscribe({ next: p => this.featured.set(p.filter(x => x.featured).slice(0, 4)) }); }
}
