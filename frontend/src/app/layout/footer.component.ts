import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="container footer-grid">
        <div><a routerLink="/" class="logo light">ENSAGULAR</a><p>Site e-commerce réalisé avec Angular, Express et SQLite.</p></div>
        <div><h4>Explorer</h4><a routerLink="/produits">La collection</a><a routerLink="/produits" [queryParams]="{category:'Maison'}">Maison</a></div>
        <div><h4>À propos</h4><p>Livraison partout au Maroc<br>Retours sous 30 jours<br>contact&#64;ensagular.ma</p></div>
      </div>
      <div class="container footer-bottom"><span>© 2026 ENSAGULAR</span><span>Paiement à la livraison</span></div>
    </footer>
  `
})
export class FooterComponent {}
