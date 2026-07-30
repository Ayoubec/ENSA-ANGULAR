import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { z } from 'zod';
import './types.js';

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 3000);
const secret = process.env.JWT_SECRET || 'development-secret';

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());

const asyncRoute = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { Promise.resolve(handler(req, res, next)).catch(next); };

function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ message: 'Authentification requise.' }); return; }
  try { req.auth = jwt.verify(token, secret) as { id: number; role: Role }; next(); }
  catch { res.status(401).json({ message: 'Session invalide ou expirée.' }); }
}
function admin(req: Request, res: Response, next: NextFunction) {
  auth(req, res, () => req.auth?.role === Role.ADMIN ? next() : res.status(403).json({ message: 'Accès administrateur requis.' }));
}
const publicUser = { id: true, name: true, email: true, role: true } as const;
const sign = (id: number, role: Role) => jwt.sign({ id, role }, secret, { expiresIn: '7d' });
const credentials = z.object({ email: z.email(), password: z.string().min(6) });

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const data = credentials.extend({ name: z.string().trim().min(2) }).parse(req.body);
  if (await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })) { res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' }); return; }
  const user = await prisma.user.create({ data: { ...data, email: data.email.toLowerCase(), password: await bcrypt.hash(data.password, 12) }, select: publicUser });
  res.status(201).json({ user, token: sign(user.id, user.role) });
}));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const data = credentials.parse(req.body); const found = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!found || !(await bcrypt.compare(data.password, found.password))) { res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' }); return; }
  const user = { id: found.id, name: found.name, email: found.email, role: found.role };
  res.json({ user, token: sign(user.id, user.role) });
}));

app.get('/api/products', asyncRoute(async (req, res) => {
  const search = String(req.query.search || ''); const category = String(req.query.category || '');
  res.json(await prisma.product.findMany({ where: { name: { contains: search }, ...(category ? { category } : {}) }, orderBy: { createdAt: 'desc' } }));
}));
app.get('/api/products/:id', asyncRoute(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
  product ? res.json(product) : res.status(404).json({ message: 'Produit introuvable.' });
}));
app.get('/api/users/me', auth, asyncRoute(async (req, res) => res.json(await prisma.user.findUnique({ where: { id: req.auth!.id }, select: publicUser }))));
app.put('/api/users/me', auth, asyncRoute(async (req, res) => {
  const data = z.object({ name: z.string().trim().min(2), email: z.email() }).parse(req.body);
  res.json(await prisma.user.update({ where: { id: req.auth!.id }, data: { ...data, email: data.email.toLowerCase() }, select: publicUser }));
}));
app.get('/api/orders/mine', auth, asyncRoute(async (req, res) => {
  res.json(await prisma.order.findMany({ where: { userId: req.auth!.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }));
}));
app.post('/api/orders', auth, asyncRoute(async (req, res) => {
  const { items } = z.object({ items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1) }).parse(req.body);
  const ids = items.map(i => i.productId); const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  if (products.length !== new Set(ids).size) { res.status(400).json({ message: 'Un produit est introuvable.' }); return; }
  for (const item of items) { const product = products.find(p => p.id === item.productId)!; if (product.stock < item.quantity) { res.status(400).json({ message: `Stock insuffisant pour ${product.name}.` }); return; } }
  const subtotal = items.reduce((sum, item) => sum + products.find(p => p.id === item.productId)!.price * item.quantity, 0);
  const total = subtotal + (subtotal >= 500 ? 0 : 30);
  const order = await prisma.$transaction(async tx => {
    for (const item of items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    return tx.order.create({ data: { userId: req.auth!.id, total, status: OrderStatus.PENDING, items: { create: items.map(item => ({ productId: item.productId, quantity: item.quantity, price: products.find(p => p.id === item.productId)!.price })) } }, include: { items: { include: { product: true } } } });
  });
  res.status(201).json(order);
}));

app.get('/api/admin/stats', admin, asyncRoute(async (_req, res) => {
  const [products, users, orders, revenue] = await Promise.all([prisma.product.count(), prisma.user.count(), prisma.order.count(), prisma.order.aggregate({ where: { status: { in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED] } }, _sum: { total: true } })]);
  res.json({ products, users, orders, revenue: revenue._sum.total || 0 });
}));
app.get('/api/admin/users', admin, asyncRoute(async (_req, res) => res.json(await prisma.user.findMany({ select: publicUser, orderBy: { createdAt: 'desc' } }))));
app.patch('/api/admin/users/:id/role', admin, asyncRoute(async (req, res) => {
  const role = z.enum(Role).parse(req.body.role);
  res.json(await prisma.user.update({ where: { id: Number(req.params.id) }, data: { role }, select: publicUser }));
}));
app.get('/api/admin/orders', admin, asyncRoute(async (_req, res) => res.json(await prisma.order.findMany({ include: { user: { select: publicUser }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }))));
app.patch('/api/admin/orders/:id/status', admin, asyncRoute(async (req, res) => {
  const status = z.enum(OrderStatus).parse(req.body.status);
  res.json(await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status }, include: { items: { include: { product: true } } } }));
}));
const productSchema = z.object({ name: z.string().min(2), description: z.string().min(5), price: z.number().nonnegative(), stock: z.number().int().nonnegative(), category: z.string().min(2), imageUrl: z.url(), featured: z.boolean().default(false) });
app.post('/api/admin/products', admin, asyncRoute(async (req, res) => res.status(201).json(await prisma.product.create({ data: productSchema.parse(req.body) }))));
app.put('/api/admin/products/:id', admin, asyncRoute(async (req, res) => res.json(await prisma.product.update({ where: { id: Number(req.params.id) }, data: productSchema.parse(req.body) }))));
app.delete('/api/admin/products/:id', admin, asyncRoute(async (req, res) => { await prisma.product.delete({ where: { id: Number(req.params.id) } }); res.status(204).send(); }));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) { res.status(400).json({ message: 'Données invalides.', errors: err.issues }); return; }
  console.error(err); res.status(500).json({ message: 'Une erreur interne est survenue.' });
});
app.listen(port, () => console.log(`API ENSAGULAR disponible sur http://localhost:${port}`));
