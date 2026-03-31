import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Role } from '../src/auth/types/role.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elyra.com' },
    update: {},
    create: {
      email: 'admin@elyra.com',
      password: hashedPassword,
      name: 'Admin Elyra',
      role: 'ADMIN',
      walletBalance: 10000000,
      membership: 'GOLD',
    },
  });

  // Create User
  const user = await prisma.user.upsert({
    where: { email: 'user@elyra.com' },
    update: {},
    create: {
      email: 'user@elyra.com',
      password: hashedPassword,
      name: 'Nguyễn Hoàng Nam',
      role: 'USER',
      walletBalance: 1500000,
      membership: 'SILVER',
    },
  });

  // Create some courts
  const courtsData = [
    { name: 'Sân 1', type: 'BADMINTON', price: 100000 },
    { name: 'Sân 2', type: 'BADMINTON', price: 100000 },
    { name: 'Sân 3', type: 'BADMINTON', price: 100000 },
    { name: 'Sân 4', type: 'PICKLEBALL', price: 120000 },
    { name: 'Sân 5', type: 'PICKLEBALL', price: 120000 },
    { name: 'Sân 6', type: 'TENNIS', price: 200000 },
  ];

  for (const c of courtsData) {
    await prisma.court.upsert({
      where: { id: c.name }, // This is just for seeding
      update: {},
      create: {
        id: c.name,
        name: c.name,
        type: c.type,
        price: c.price,
        status: 'AVAILABLE',
      },
    });
  }

  // Create some slots
  const slotsData = [
    { time: '05:00 - 06:00', price: 100000 },
    { time: '06:00 - 07:00', price: 120000 },
    { time: '17:00 - 18:00', price: 180000 },
    { time: '18:00 - 19:00', price: 220000 },
    { time: '19:00 - 20:00', price: 220000 },
  ];

  for (const s of slotsData) {
    await prisma.slot.upsert({
      where: { id: s.time },
      update: {},
      create: {
        id: s.time,
        time: s.time,
        price: s.price,
      },
    });
  }

  // Create initial products
  const productsData = [
    { 
      id: 'racket-01', 
      name: 'Yonex Astrox 88D Pro', 
      category: 'Vợt Cầu Lông',
      price: 3850000, 
      stock: 5,
      description: 'Vợt thiên công, phù hợp người chơi có lực tay tốt.',
      tag: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1558365849-6ebb21c3f4df?q=80&w=1600&auto=format&fit=crop'
    },
    { 
      id: 'racket-02', 
      name: 'Lining Tectonic 7', 
      category: 'Vợt Cầu Lông',
      price: 3200000, 
      stock: 8,
      description: 'Vợt cân bằng, linh hoạt trong cả tấn công và phòng thủ.',
      image: 'https://images.unsplash.com/photo-1626225967045-9410dd993e41?q=80&w=1600&auto=format&fit=crop'
    },
    { 
      id: 'shuttle-01', 
      name: 'Cầu Thành Công (12 quả)', 
      category: 'Quả Cầu Lông',
      price: 220000, 
      stock: 50,
      description: 'Cầu lông vũ tiêu chuẩn thi đấu, độ bền cao.',
      tag: 'Hot',
      image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=1600&auto=format&fit=crop'
    },
    { 
      id: 'shoes-01', 
      name: 'Victor P9200TTY', 
      category: 'Giày Cầu Lông',
      price: 2450000, 
      stock: 3,
      description: 'Phiên bản giới hạn Tai Tzu Ying, hỗ trợ di chuyển tối ưu.',
      tag: 'New',
      image: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?q=80&w=1600&auto=format&fit=crop'
    },
    { 
      id: 'grip-01', 
      name: 'Quấn cán Yonex AC102EX', 
      category: 'Phụ Kiện',
      price: 45000, 
      stock: 100,
      description: 'Độ bám tốt, thấm hút mồ hôi hiệu quả.',
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1600&auto=format&fit=crop'
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        description: p.description,
        tag: p.tag,
        image: p.image,
      },
      create: p,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
