import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(this.readUser());
  token = signal<string | null>(localStorage.getItem('token'));
  isAdmin = computed(() => this.user()?.role === 'ADMIN');
  setSession(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token.set(token); this.user.set(user);
  }
  updateUser(user: User) { localStorage.setItem('user', JSON.stringify(user)); this.user.set(user); }
  logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); this.token.set(null); this.user.set(null); }
  private readUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null') as User | null; } catch { return null; }
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'ensagular-cart-v2';
  items = signal<CartItem[]>(this.read());
  count = computed(() => this.items().reduce((n, item) => n + item.quantity, 0));
  total = computed(() => this.items().reduce((n, item) => n + item.product.price * item.quantity, 0));
  add(product: Product) {
    if (product.stock <= 0) return;
    const items = [...this.items()];
    const existing = items.find(item => item.product.id === product.id);
    if (existing) {
      const updated = items.map(item => item.product.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
        : item);
      this.save(updated);
      return;
    }
    else items.push({ product, quantity: 1 });
    this.save(items);
  }
  quantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.remove(productId); return; }
    const items = this.items().map(item => item.product.id === productId
      ? { ...item, quantity: Math.min(quantity, item.product.stock) }
      : item);
    this.save(items);
  }
  remove(productId: number) { this.save(this.items().filter(item => item.product.id !== productId)); }
  clear() { this.save([]); }
  private save(items: CartItem[]) { localStorage.setItem(this.storageKey, JSON.stringify(items)); this.items.set(items); }
  private read(): CartItem[] { try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]') as CartItem[]; } catch { return []; } }
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<{ id: number; text: string; type: 'success' | 'error' }[]>([]);
  show(text: string, type: 'success' | 'error' = 'success') {
    const id = Date.now(); this.messages.update(items => [...items, { id, text, type }]);
    setTimeout(() => this.messages.update(items => items.filter(item => item.id !== id)), 3200);
  }
}
