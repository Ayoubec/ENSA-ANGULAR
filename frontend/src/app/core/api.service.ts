import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, Order, OrderStatus, Role, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api';

  products(search = '', category = '') {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<Product[]>(`${this.base}/products`, { params });
  }
  product(id: number) { return this.http.get<Product>(`${this.base}/products/${id}`); }
  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string; user: User }>(`${this.base}/auth/login`, data);
  }
  register(data: { name: string; email: string; password: string }) {
    return this.http.post<{ token: string; user: User }>(`${this.base}/auth/register`, data);
  }
  profile() { return this.http.get<User>(`${this.base}/users/me`); }
  updateProfile(data: { name: string; email: string }) {
    return this.http.put<User>(`${this.base}/users/me`, data);
  }
  myOrders() { return this.http.get<Order[]>(`${this.base}/orders/mine`); }
  checkout(items: { productId: number; quantity: number }[]) {
    return this.http.post<Order>(`${this.base}/orders`, { items });
  }
  stats() { return this.http.get<{ products: number; users: number; orders: number; revenue: number }>(`${this.base}/admin/stats`); }
  users() { return this.http.get<User[]>(`${this.base}/admin/users`); }
  setRole(id: number, role: Role) { return this.http.patch<User>(`${this.base}/admin/users/${id}/role`, { role }); }
  orders() { return this.http.get<Order[]>(`${this.base}/admin/orders`); }
  setStatus(id: number, status: OrderStatus) { return this.http.patch<Order>(`${this.base}/admin/orders/${id}/status`, { status }); }
  saveProduct(data: Partial<Product>, id?: number) {
    return id ? this.http.put<Product>(`${this.base}/admin/products/${id}`, data) : this.http.post<Product>(`${this.base}/admin/products`, data);
  }
  deleteProduct(id: number) { return this.http.delete(`${this.base}/admin/products/${id}`); }
}
