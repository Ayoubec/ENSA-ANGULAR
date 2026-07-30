export type Role = 'USER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';

export interface User { id: number; name: string; email: string; role: Role; }
export interface Product {
  id: number; name: string; description: string; price: number; stock: number;
  category: string; imageUrl: string; featured: boolean;
}
export interface CartItem { product: Product; quantity: number; }
export interface OrderItem { id: number; quantity: number; price: number; product: Product; }
export interface Order {
  id: number; total: number; status: OrderStatus; createdAt: string;
  user?: User; items: OrderItem[];
}
