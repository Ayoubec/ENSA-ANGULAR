const base = 'http://localhost:3000/api';

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${base}${path}`, options);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const json = (method: string, body?: unknown, token?: string): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
});

async function main() {
  const health = await request('/health');
  if (health.status !== 'ok') throw new Error('Healthcheck invalide');

  const products = await request('/products');
  if (products.length < 8) throw new Error('Catalogue incomplet');
  const filtered = await request('/products?search=Vase&category=Maison');
  if (filtered.length !== 1) throw new Error('Recherche ou filtre invalide');
  await request(`/products/${products[0].id}`);

  const adminLogin = await request('/auth/login', json('POST', { email: 'admin@noma.fr', password: 'Admin123!' }));
  const userLogin = await request('/auth/login', json('POST', { email: 'camille@noma.fr', password: 'User123!' }));
  const adminToken = adminLogin.token as string;
  const userToken = userLogin.token as string;

  await request('/users/me', json('GET', undefined, userToken));
  await request('/users/me', json('PUT', { name: 'Camille Martin', email: 'camille@noma.fr' }, userToken));
  await request('/orders/mine', json('GET', undefined, userToken));
  const newOrder = await request('/orders', json('POST', { items: [{ productId: products[0].id, quantity: 1 }] }, userToken));
  if (newOrder.status !== 'PENDING') throw new Error('La commande doit attendre le paiement à la livraison');
  const expectedTotal = products[0].price < 500 ? products[0].price + 30 : products[0].price;
  if (Math.abs(newOrder.total - expectedTotal) > 0.001) throw new Error('Total de commande incorrect');

  const stats = await request('/admin/stats', json('GET', undefined, adminToken));
  if (!stats.products || !stats.users || !stats.orders) throw new Error('Statistiques invalides');
  const users = await request('/admin/users', json('GET', undefined, adminToken));
  const customer = users.find((user: { email: string }) => user.email === 'camille@noma.fr');
  await request(`/admin/users/${customer.id}/role`, json('PATCH', { role: 'USER' }, adminToken));
  const orders = await request('/admin/orders', json('GET', undefined, adminToken));
  await request(`/admin/orders/${orders[0].id}/status`, json('PATCH', { status: orders[0].status }, adminToken));

  const created = await request('/admin/products', json('POST', {
    name: 'Produit Smoke Test',
    description: 'Produit temporaire créé par le test automatisé.',
    price: 12.5,
    stock: 3,
    category: 'Maison',
    imageUrl: 'https://example.com/product.jpg',
    featured: false
  }, adminToken));
  await request(`/admin/products/${created.id}`, json('PUT', { ...created, name: 'Produit Smoke Test modifié' }, adminToken));
  await request(`/admin/products/${created.id}`, json('DELETE', undefined, adminToken));

  console.log('✓ 18 contrôles API réussis : public, USER, panier, paiement à la livraison et ADMIN');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
