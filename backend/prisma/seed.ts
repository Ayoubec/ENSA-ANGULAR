import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const products = [
  { name: 'Vase Sora', category: 'Maison', price: 420, stock: 18, featured: true, imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=85', description: 'Un vase sculptural en grès mat, façonné à la main. Ses lignes organiques accueillent aussi bien une branche séchée qu’un bouquet frais.' },
  { name: 'Lampe Alba', category: 'Maison', price: 890, stock: 9, featured: true, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85', description: 'Une lumière douce et enveloppante diffusée par un abat-jour en lin naturel. Parfaite sur un bureau ou une table de chevet.' },
  { name: 'Plaid Lino', category: 'Maison', price: 650, stock: 14, featured: true, imageUrl: 'https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=800&q=85', description: 'Un plaid léger en mélange de lin et coton, lavé pour une douceur immédiate. Finitions frangées et teinte naturelle.' },
  { name: 'Tasse Nami', category: 'Cuisine', price: 190, stock: 32, featured: true, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85', description: 'Tasse en céramique émaillée, tournée artisanalement. Chaque pièce présente de légères variations qui la rendent unique.' },
  { name: 'Planche Oka', category: 'Cuisine', price: 350, stock: 20, featured: false, imageUrl: 'https://images.unsplash.com/photo-1523413307857-ef24c53571d5?auto=format&fit=crop&w=800&q=85', description: 'Planche de service en bois d’acacia certifié, huilée naturellement et pensée pour durer.' },
  { name: 'Bougie Hinoki', category: 'Bien-être', price: 280, stock: 25, featured: false, imageUrl: 'https://images.unsplash.com/photo-1602874801006-e26d6b2b70c0?auto=format&fit=crop&w=800&q=85', description: 'Une bougie végétale aux notes boisées de cyprès japonais, coulée dans un verre ambré réutilisable.' },
  { name: 'Carnet Mori', category: 'Papeterie', price: 160, stock: 40, featured: false, imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85', description: 'Carnet relié de 160 pages en papier recyclé ivoire, pour vos idées, croquis et listes du quotidien.' },
  { name: 'Coussin Yuki', category: 'Maison', price: 390, stock: 17, featured: false, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85', description: 'Coussin en coton tissé à la texture subtile, garni de fibres recyclées et déhoussable.' }
];

async function main() {
  await prisma.orderItem.deleteMany(); await prisma.order.deleteMany(); await prisma.product.deleteMany(); await prisma.user.deleteMany();
  const password = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({ data: { name: 'Admin Noma', email: 'admin@noma.fr', password, role: Role.ADMIN } });
  const user = await prisma.user.create({ data: { name: 'Camille Martin', email: 'camille@noma.fr', password: await bcrypt.hash('User123!', 12) } });
  await prisma.product.createMany({ data: products });
  const first = await prisma.product.findMany({ take: 2 });
  await prisma.order.create({ data: { userId: user.id, total: first[0].price + first[1].price, status: OrderStatus.CONFIRMED, items: { create: first.map(p => ({ productId: p.id, quantity: 1, price: p.price })) } } });
  console.log(`Seed terminé. Admin: ${admin.email} / Admin123!`);
}
main().finally(() => prisma.$disconnect());
