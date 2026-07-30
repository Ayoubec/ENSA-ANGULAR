import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <section class="page-hero compact container"><h1>Catalogue des produits</h1><p>Recherchez un produit ou filtrez la liste par catégorie.</p></section>
    <section class="container catalog">
      <div class="filters">
        <label class="search"><span>⌕</span><input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Rechercher un produit"></label>
        <div class="category-list">
          @for (cat of categories; track cat) { <button [class.active]="category() === cat" (click)="setCategory(cat)">{{ cat || 'Tout' }}</button> }
        </div>
      </div>
      <div class="catalog-count">{{ products().length }} produits</div>
      @if (loading()) { <div class="empty">Chargement de la collection…</div> }
      @else if (!products().length) { <div class="empty">Aucun produit ne correspond à votre recherche.</div> }
      @else { <div class="product-grid">@for (product of products(); track product.id) { <app-product-card [product]="product" /> }</div> }
    </section>
  `
})
export class CatalogComponent implements OnInit {
  private api = inject(ApiService); private route = inject(ActivatedRoute);
  products = signal<Product[]>([]); loading = signal(true); category = signal(''); search = '';
  categories = ['', 'Maison', 'Cuisine', 'Bien-être', 'Papeterie'];
  ngOnInit() { this.category.set(this.route.snapshot.queryParamMap.get('category') || ''); this.load(); }
  setCategory(category: string) { this.category.set(category); this.load(); }
  load() { this.loading.set(true); this.api.products(this.search, this.category()).subscribe({ next: p => { this.products.set(p); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
