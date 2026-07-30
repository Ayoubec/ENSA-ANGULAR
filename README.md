# ENSAGULAR — E-commerce - Ayoub Echahidpus

Application e-commerce complète composée de deux projets indépendants :

- `frontend/` : Angular, Router, Reactive Forms et HttpClient ;
- `backend/` : Express, TypeScript, Prisma, SQLite, JWT et bcrypt.

## Installation

Prérequis : Node.js 20 ou supérieur et npm.

```bash
cd mini-ecommerce
npm run install:all
npm run setup
```

Lancer ensuite chaque projet dans un terminal :

```bash
npm run dev:backend
npm run dev:frontend
```

L'interface est accessible sur http://localhost:4200 et l'API sur
http://localhost:3000/api.

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@noma.fr` | `Admin123!` |
| Utilisateur | `camille@noma.fr` | `User123!` |

Le paiement s'effectue à la livraison. La validation du panier crée une
commande en attente, que l'administrateur peut ensuite confirmer.

## Commandes utiles

```bash
npm run build
npm run db:seed --prefix backend
```

Le fichier `backend/.env` contient les réglages locaux. Pour un autre
environnement, copier `.env.example`, changer `JWT_SECRET` et adapter les URL.
