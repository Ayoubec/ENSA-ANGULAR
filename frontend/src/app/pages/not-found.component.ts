import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ standalone: true, imports: [RouterLink], template: `<div class="empty-state page-space"><div>404</div><h1>Cette page n'existe pas</h1><a routerLink="/" class="button">Retour à l'accueil</a></div>` })
export class NotFoundComponent {}
