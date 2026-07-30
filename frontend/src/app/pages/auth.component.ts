import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService, ToastService } from '../core/state.services';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-visual"><div><span class="logo light">ENSAGULAR</span><blockquote>Votre boutique en ligne simple et pratique.</blockquote></div></div>
      <div class="auth-panel">
        <div class="auth-card">
          <span class="kicker">{{ register() ? 'Bienvenue sur ENSAGULAR' : 'Heureux de vous revoir' }}</span>
          <h1>{{ register() ? 'Créer un compte' : 'Se connecter' }}</h1>
          <p>{{ register() ? 'Rejoignez-nous en quelques secondes.' : 'Accédez à vos commandes et vos favoris.' }}</p>
          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (register()) { <label>Nom complet<input formControlName="name" placeholder="Votre nom"></label> }
            <label>Adresse e-mail<input type="email" formControlName="email" placeholder="vous@exemple.fr"></label>
            <label>Mot de passe<input type="password" formControlName="password" placeholder="6 caractères minimum"></label>
            @if (error) { <div class="form-error">{{ error }}</div> }
            <button class="button full" [disabled]="form.invalid || loading">{{ loading ? 'Un instant…' : (register() ? 'Créer mon compte' : 'Se connecter') }} <span>→</span></button>
          </form>
          <div class="auth-switch">{{ register() ? 'Déjà un compte ?' : 'Pas encore de compte ?' }} <a [routerLink]="register() ? '/connexion' : '/inscription'">{{ register() ? 'Se connecter' : 'Créer un compte' }}</a></div>
          @if (!register()) { <div class="demo-hint">Démo admin : admin&#64;noma.fr / Admin123!</div> }
        </div>
      </div>
    </section>
  `
})
export class AuthComponent {
  register = input(false);
  private fb = inject(FormBuilder); private api = inject(ApiService); private auth = inject(AuthService); private router = inject(Router); private toast = inject(ToastService);
  loading = false; error = '';
  form = this.fb.nonNullable.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]] });
  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const value = this.form.getRawValue();
    const request = this.register() ? this.api.register(value) : this.api.login(value);
    request.subscribe({
      next: result => { this.auth.setSession(result.token, result.user); this.toast.show(this.register() ? 'Compte créé avec succès' : 'Connexion réussie'); this.router.navigateByUrl('/'); },
      error: err => { this.loading = false; this.error = err.error?.message || 'Une erreur est survenue.'; }
    });
  }
}
