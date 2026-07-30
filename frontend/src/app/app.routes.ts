import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';
import { HomeComponent } from './pages/home.component';
import { CatalogComponent } from './pages/catalog.component';
import { ProductDetailComponent } from './pages/product-detail.component';
import { AuthComponent } from './pages/auth.component';
import { CartComponent } from './pages/cart.component';
import { AccountComponent } from './pages/account.component';
import { AdminComponent } from './pages/admin.component';
import { NotFoundComponent } from './pages/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'produits', component: CatalogComponent },
  { path: 'produits/:id', component: ProductDetailComponent },
  { path: 'connexion', component: AuthComponent },
  { path: 'inscription', component: AuthComponent, data: { register: true }, providers: [], resolve: {}, title: 'Inscription' },
  { path: 'panier', component: CartComponent },
  { path: 'commandes', component: AccountComponent, canActivate: [authGuard] },
  { path: 'profil', component: AccountComponent, canActivate: [authGuard], data: { initialTab: 'profile' } },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', component: NotFoundComponent }
];
