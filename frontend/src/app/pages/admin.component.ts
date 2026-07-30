import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Order, OrderStatus, Product, Role, User } from '../core/models';
import { ToastService } from '../core/state.services';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <section class="admin-page container page-space">
      <div class="page-title row"><div><span class="kicker">Espace administrateur</span><h1>Tableau de bord</h1></div><span class="admin-badge">Mode admin</span></div>
      @if (stats(); as s) {
        <div class="stats"><article><span>Produits</span><b>{{ s.products }}</b><small>dans la collection</small></article><article><span>Utilisateurs</span><b>{{ s.users }}</b><small>comptes inscrits</small></article><article><span>Commandes</span><b>{{ s.orders }}</b><small>au total</small></article><article class="accent"><span>Chiffre d'affaires</span><b>{{ s.revenue | currency:'MAD':'Dh':'1.0-0':'fr' }}</b><small>commandes confirmées</small></article></div>
      }
      <div class="admin-tabs"><button [class.active]="tab() === 'products'" (click)="tab.set('products')">Produits</button><button [class.active]="tab() === 'orders'" (click)="tab.set('orders')">Commandes</button><button [class.active]="tab() === 'users'" (click)="tab.set('users')">Utilisateurs</button></div>
      @if (tab() === 'products') {
        <div class="admin-heading"><h2>Gestion des produits</h2><button class="button" (click)="edit()">+ Ajouter un produit</button></div>
        @if (editing()) {
          <form class="product-form" [formGroup]="form" (ngSubmit)="saveProduct()"><h3>{{ editing()?.id ? 'Modifier le produit' : 'Nouveau produit' }}</h3><div class="form-grid"><label>Nom<input formControlName="name"></label><label>Catégorie<select formControlName="category"><option>Maison</option><option>Cuisine</option><option>Bien-être</option><option>Papeterie</option></select></label><label>Prix (Dh)<input type="number" formControlName="price"></label><label>Stock<input type="number" formControlName="stock"></label><label class="wide">URL de l'image<input formControlName="imageUrl"></label><label class="wide">Description<textarea formControlName="description"></textarea></label><label class="check"><input type="checkbox" formControlName="featured"> Produit mis en avant</label></div><div class="form-actions"><button type="button" class="button secondary" (click)="editing.set(null)">Annuler</button><button class="button" [disabled]="form.invalid">Enregistrer</button></div></form>
        }
        <div class="admin-list">
          @for (p of products(); track p.id) { <article><img [src]="p.imageUrl" [alt]="p.name" loading="lazy" decoding="async"><div class="grow"><b>{{ p.name }}</b><small>{{ p.category }}</small></div><span>{{ p.stock }} en stock</span><strong>{{ p.price | currency:'MAD':'Dh':'1.2-2':'fr' }}</strong><button (click)="edit(p)">Modifier</button><button class="danger" (click)="removeProduct(p)">Supprimer</button></article> }
        </div>
      } @else if (tab() === 'orders') {
        <div class="admin-heading"><h2>Toutes les commandes</h2></div>
        <div class="admin-table">@for (o of orders(); track o.id) { <article><b>#{{ o.id.toString().padStart(4, '0') }}</b><span class="grow">{{ o.user?.name }}<small>{{ o.createdAt | date:'dd/MM/yyyy' }}</small></span><strong>{{ o.total | currency:'MAD':'Dh':'1.2-2':'fr' }}</strong><select [value]="o.status" (change)="status(o, $any($event.target).value)"><option value="PENDING">En attente</option><option value="CONFIRMED">Confirmée</option><option value="SHIPPED">Expédiée</option><option value="CANCELLED">Annulée</option></select></article> }</div>
      } @else {
        <div class="admin-heading"><h2>Utilisateurs</h2></div>
        <div class="admin-table">@for (u of users(); track u.id) { <article><span class="avatar">{{ u.name[0] }}</span><span class="grow"><b>{{ u.name }}</b><small>{{ u.email }}</small></span><select [value]="u.role" (change)="role(u, $any($event.target).value)"><option value="USER">Utilisateur</option><option value="ADMIN">Administrateur</option></select></article> }</div>
      }
    </section>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService); private fb = inject(FormBuilder); private toast = inject(ToastService);
  tab = signal<'products' | 'orders' | 'users'>('products'); stats = signal<any>(null); products = signal<Product[]>([]); orders = signal<Order[]>([]); users = signal<User[]>([]); editing = signal<Product | Partial<Product> | null>(null);
  form = this.fb.nonNullable.group({ name: ['', Validators.required], category: ['Maison', Validators.required], price: [0, [Validators.required, Validators.min(0)]], stock: [0, [Validators.required, Validators.min(0)]], imageUrl: ['', Validators.required], description: ['', Validators.required], featured: [false] });
  ngOnInit() { this.reload(); }
  reload() { this.api.stats().subscribe(s => this.stats.set(s)); this.api.products().subscribe(p => this.products.set(p)); this.api.orders().subscribe(o => this.orders.set(o)); this.api.users().subscribe(u => this.users.set(u)); }
  edit(p?: Product) { this.editing.set(p || {}); this.form.reset(p ? { ...p } : { name: '', category: 'Maison', price: 0, stock: 0, imageUrl: '', description: '', featured: false }); }
  saveProduct() { const current = this.editing(); this.api.saveProduct(this.form.getRawValue(), current?.id).subscribe(() => { this.editing.set(null); this.toast.show('Produit enregistré'); this.reload(); }); }
  removeProduct(p: Product) { if (confirm(`Supprimer « ${p.name} » ?`)) this.api.deleteProduct(p.id).subscribe(() => { this.toast.show('Produit supprimé'); this.reload(); }); }
  role(u: User, role: Role) { this.api.setRole(u.id, role).subscribe(() => { this.toast.show('Rôle mis à jour'); this.reload(); }); }
  status(o: Order, status: OrderStatus) { this.api.setStatus(o.id, status).subscribe(() => { this.toast.show('Statut mis à jour'); this.reload(); }); }
}
