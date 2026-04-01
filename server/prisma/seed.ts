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
    ...Array(4).fill(null).map((_, i) => ({
      id: `pickleball-${i + 1}`,
      name: `Pickleball ${i + 1}`,
      type: 'PICKLEBALL',
      price: 120000,
      position: JSON.stringify([-25 + (i * 12), 0, 45]),
    })),
    ...Array(4).fill(null).map((_, i) => ({
      id: `badminton-${i + 1}`,
      name: `Badminton ${i + 1}`,
      type: 'BADMINTON',
      price: 150000,
      position: JSON.stringify([-20 + (i * 10), 0, 80]),
    })),
    {
      id: 'tennis-1',
      name: 'Tennis 1',
      type: 'TENNIS',
      price: 250000,
      position: JSON.stringify([0, 0, 125]),
    }
  ];

  for (const c of courtsData) {
    await prisma.court.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        type: c.type,
        price: c.price,
        position: c.position,
      },
      create: {
        id: c.id,
        name: c.name,
        type: c.type,
        price: c.price,
        position: c.position,
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
      image: 'https://shopvnb.com/uploads/gallery/vot-cau-long-yonex-astrox-88d-pro-2024-chinh-hang_1710115822.webp'
    },
    { 
      id: 'racket-02', 
      name: 'Lining Tectonic 7', 
      category: 'Vợt Cầu Lông',
      price: 3200000, 
      stock: 8,
      description: 'Vợt cân bằng, linh hoạt trong cả tấn công và phòng thủ.',
      image: 'https://shopvnb.com/uploads/gallery/vot-cau-long-lining-tectonic-7-chinh-hang_1678128373.webp'
    },
    { 
      id: 'shuttle-01', 
      name: 'Cầu Thành Công (12 quả)', 
      category: 'Quả Cầu Lông',
      price: 220000, 
      stock: 50,
      description: 'Cầu lông vũ tiêu chuẩn thi đấu, độ bền cao.',
      tag: 'Hot',
      image: 'https://shopvnb.com/uploads/gallery/ong-cau-long-thanh-cong-chinh-hang.jpg'
    },
    { 
      id: 'shoes-01', 
      name: 'Victor P9200TTY', 
      category: 'Giày Cầu Lông',
      price: 2450000, 
      stock: 3,
      description: 'Phiên bản giới hạn Tai Tzu Ying, hỗ trợ di chuyển tối ưu.',
      tag: 'New',
      image: 'https://shopvnb.com/uploads/gallery/giay-cau-long-victor-p9200tty-a-trang-chinh-hang_1711685084.webp'
    },
    { 
      id: 'grip-01', 
      name: 'Quấn cán Yonex AC102EX', 
      category: 'Phụ Kiện',
      price: 45000, 
      stock: 100,
      description: 'Độ bám tốt, thấm hút mồ hôi hiệu quả.',
      image: 'https://shopvnb.com/uploads/gallery/quan-can-vot-cau-long-yonex-ac-102ex-chinh-hang_1684534033.webp'
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
