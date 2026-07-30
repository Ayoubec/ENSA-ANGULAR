import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';
import { AuthService, ToastService } from '../core/state.services';

@Component({
  standalone: true,
  imports: [DatePipe, CurrencyPipe, ReactiveFormsModule],
  template: `
    <section class="container page-space">
      @if (profile()) {
        <div class="page-title"><span class="kicker">Mon espace</span><h1>Bonjour, {{ auth.user()?.name?.split(' ')?.[0] }}.</h1></div>
        <div class="account-layout">
          <aside class="account-nav"><button [class.active]="tab() === 'orders'" (click)="tab.set('orders')">Mes commandes</button><button [class.active]="tab() === 'profile'" (click)="tab.set('profile')">Mes informations</button><button class="logout" (click)="logout()">Se déconnecter</button></aside>
          <div class="account-content">
            @if (tab() === 'orders') {
              <h2>Mes commandes</h2>
              @if (!orders().length) { <p class="muted">Vous n'avez pas encore passé de commande.</p> }
              @for (order of orders(); track order.id) {
                <article class="order-card">
                  <div class="order-head"><span><small>Commande</small><b>#{{ order.id.toString().padStart(4, '0') }}</b></span><span><small>Date</small><b>{{ order.createdAt | date:'dd MMM yyyy':'':'fr' }}</b></span><span class="status" [attr.data-status]="order.status">{{ statusLabel(order.status) }}</span></div>
                  @for (item of order.items; track item.id) { <div class="order-item"><img [src]="item.product.imageUrl" [alt]="item.product.name" loading="lazy" decoding="async"><span>{{ item.product.name }} <small>× {{ item.quantity }}</small></span><b>{{ item.price * item.quantity | currency:'MAD':'Dh':'1.2-2':'fr' }}</b></div> }
                  <div class="order-total">Total <b>{{ order.total | currency:'MAD':'Dh':'1.2-2':'fr' }}</b></div>
                </article>
              }
            } @else {
              <h2>Mes informations</h2>
              <form [formGroup]="form" (ngSubmit)="save()" class="profile-form"><label>Nom complet<input formControlName="name"></label><label>Adresse e-mail<input formControlName="email"></label><button class="button" [disabled]="form.invalid">Enregistrer les modifications</button></form>
            }
          </div>
        </div>
      }
    </section>
  `
})
export class AccountComponent implements OnInit {
  initialTab = input<'orders' | 'profile'>('orders'); private api = inject(ApiService); auth = inject(AuthService); private fb = inject(FormBuilder); private router = inject(Router); private toast = inject(ToastService);
  orders = signal<Order[]>([]); profile = signal(false); tab = signal<'orders' | 'profile'>('orders');
  form = this.fb.nonNullable.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]] });
  ngOnInit() { this.tab.set(this.initialTab()); this.api.profile().subscribe(u => { this.auth.updateUser(u); this.form.patchValue(u); this.profile.set(true); }); this.api.myOrders().subscribe(o => this.orders.set(o)); }
  save() { this.api.updateProfile(this.form.getRawValue()).subscribe(u => { this.auth.updateUser(u); this.toast.show('Profil mis à jour'); }); }
  logout() { this.auth.logout(); this.toast.show('Vous êtes déconnecté'); this.router.navigateByUrl('/'); }
  statusLabel(s: string) { return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', SHIPPED: 'Expédiée', CANCELLED: 'Annulée' } as Record<string, string>)[s]; }
}
