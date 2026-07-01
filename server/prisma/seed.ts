import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@elyra.com' },
    update: {},
    create: {
      id: 'admin-1',
      email: 'admin@elyra.com',
      password: hashedPassword,
      name: 'Admin Elyra',
      role: 'ADMIN',
      walletBalance: 10000000,
      membership: 'GOLD',
    },
  });

  // Create User
  await prisma.user.upsert({
    where: { email: 'user@elyra.com' },
    update: {},
    create: {
      id: 'user-1',
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
    // Pickleball courts (front zone)
    { id: 'pickleball-1', name: 'Pickleball 1', type: 'PICKLEBALL', price: 120000, position: '[-30,0,35]', isHot: true, isDiscount: false },
    { id: 'pickleball-2', name: 'Pickleball 2', type: 'PICKLEBALL', price: 120000, position: '[-18,0,35]', isHot: true, isDiscount: false },
    { id: 'pickleball-3', name: 'Pickleball 3', type: 'PICKLEBALL', price: 120000, position: '[-6,0,35]', isHot: false, isDiscount: false },
    { id: 'pickleball-4', name: 'Pickleball 4', type: 'PICKLEBALL', price: 120000, position: '[6,0,35]', isHot: false, isDiscount: false },
    { id: 'pickleball-5', name: 'Pickleball 5', type: 'PICKLEBALL', price: 120000, position: '[18,0,35]', isHot: false, isDiscount: false },
    { id: 'pickleball-6', name: 'Pickleball 6', type: 'PICKLEBALL', price: 120000, position: '[30,0,35]', isHot: false, isDiscount: false },
    // Badminton courts (center zone)
    { id: 'badminton-1', name: 'Badminton 1', type: 'BADMINTON', price: 150000, position: '[-30,0,75]', isHot: true, isDiscount: false },
    { id: 'badminton-2', name: 'Badminton 2', type: 'BADMINTON', price: 150000, position: '[-18,0,75]', isHot: true, isDiscount: false },
    { id: 'badminton-3', name: 'Badminton 3', type: 'BADMINTON', price: 150000, position: '[-6,0,75]', isHot: false, isDiscount: false },
    { id: 'badminton-4', name: 'Badminton 4', type: 'BADMINTON', price: 150000, position: '[6,0,75]', isHot: false, isDiscount: false },
    { id: 'badminton-5', name: 'Badminton 5', type: 'BADMINTON', price: 150000, position: '[18,0,75]', isHot: false, isDiscount: false },
    { id: 'badminton-6', name: 'Badminton 6', type: 'BADMINTON', price: 150000, position: '[30,0,75]', isHot: false, isDiscount: false },
    // Tennis courts: 2 balanced courts, better centered!
    { id: 'tennis-1', name: 'Tennis 1', type: 'TENNIS', price: 250000, position: '[-18,0,125]', isHot: false, isDiscount: false },
    { id: 'tennis-2', name: 'Tennis 2', type: 'TENNIS', price: 250000, position: '[18,0,125]', isHot: false, isDiscount: true },
  ];

  for (const c of courtsData) {
    await prisma.court.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...c,
        status: 'AVAILABLE',
      },
    });
  }

  // Create some slots
  const slotsData = [
    { id: 'slot-1', time: '07:00 - 08:00', price: 120000 },
    { id: 'slot-2', time: '08:00 - 09:00', price: 120000 },
    { id: 'slot-3', time: '09:00 - 10:00', price: 120000 },
    { id: 'slot-4', time: '10:00 - 11:00', price: 120000 },
    { id: 'slot-5', time: '11:00 - 12:00', price: 120000 },
    { id: 'slot-6', time: '12:00 - 13:00', price: 120000 },
    { id: 'slot-7', time: '13:00 - 14:00', price: 120000 },
    { id: 'slot-8', time: '14:00 - 15:00', price: 120000 },
    { id: 'slot-9', time: '15:00 - 16:00', price: 150000 },
    { id: 'slot-10', time: '16:00 - 17:00', price: 150000 },
    { id: 'slot-11', time: '17:00 - 18:00', price: 180000 },
    { id: 'slot-12', time: '18:00 - 19:00', price: 220000 },
    { id: 'slot-13', time: '19:00 - 20:00', price: 220000 },
    { id: 'slot-14', time: '20:00 - 21:00', price: 180000 },
    { id: 'slot-15', time: '21:00 - 22:00', price: 150000 },
  ];

  for (const s of slotsData) {
    await prisma.slot.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // Create initial products
  const productsData = [
    { 
      id: 'racket-1', 
      name: 'Yonex Astrox 88D Pro', 
      category: 'Vợt Cầu Lông',
      price: 3850000, 
      stock: 5,
      description: 'Vợt thiên công, phù hợp người chơi có lực tay tốt, chuyên dùng cho tấn công mạnh mẽ.',
      tag: 'Best Seller',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZTFlMmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiBmb250LXNpemU9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzliNTZmIj7wn5S/PC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LXdlaWdodD0iYm9sZCI+Vl9UX0M8L3RleHQ+PC9zdmc+'
    },
    { 
      id: 'racket-2', 
      name: 'Lining Tectonic 7', 
      category: 'Vợt Cầu Lông',
      price: 3200000, 
      stock: 8,
      description: 'Vợt cân bằng, linh hoạt trong cả tấn công và phòng thủ, phù hợp mọi trình độ.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMmQxYTIyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGQwYjBkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzIpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNzE3MzYiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5MSU5JTkc8L3RleHQ+PC9zdmc+'
    },
    { 
      id: 'racket-3', 
      name: 'Victor Thruster F Claw', 
      category: 'Vợt Cầu Lông',
      price: 4200000, 
      stock: 4,
      description: 'Vợt top đầu, thiết kế head-heavy, lực đập cực mạnh, dành cho người chơi tấn công.',
      tag: 'Hot',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImczIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTIwMjA3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDYwNDA2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzMpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZjE5NTAiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5WSUNUT1I8L3RleHQ+PC9zdmc+'
    },
    { 
      id: 'shuttle-1', 
      name: 'Cầu Thành Công (12 quả)', 
      category: 'Quả Cầu Lông',
      price: 220000, 
      stock: 50,
      description: 'Cầu lông vũ tiêu chuẩn thi đấu, độ bền cao, quỹ đạo ổn định.',
      tag: 'Hot',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTAxYjE3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDQwNzA1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzQpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3YmQxNGIiP/Cfk7M8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5DQUlMQU5HTzwvdGV4dD48L3N2Zz4='
    },
    { 
      id: 'shuttle-2', 
      name: 'Cầu RSL Tourney Classic', 
      category: 'Quả Cầu Lông',
      price: 350000, 
      stock: 30,
      description: 'Cầu lông vũ chất lượng cao, dùng cho các giải đấu chuyên nghiệp.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZDIxMjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNTA1MDciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNSkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk0YTM0YiI+8J+Tsw8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5SU0w8L3RleHQ+PC9zdmc+'
    },
    { 
      id: 'shoes-1', 
      name: 'Victor P9200TTY', 
      category: 'Giày Cầu Lông',
      price: 2450000, 
      stock: 3,
      description: 'Phiên bản giới hạn Tai Tzu Ying, hỗ trợ di chuyển tối ưu, đệm Shock Absorption.',
      tag: 'New',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzYiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxODE1MTUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDAwNDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNikiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2YzN2IyMiI+8J+TqTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkdJQUhTPC90ZXh0Pjwvc3ZnPg=='
    },
    { 
      id: 'shoes-2', 
      name: 'Yonex SHB 65Z3', 
      category: 'Giày Cầu Lông',
      price: 2850000, 
      stock: 6,
      description: 'Giày cầu lông cao cấp, hỗ trợ nhanh nhẹ, bám sân tốt.',
      tag: 'Best Seller',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFhMmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYjBiMGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNykiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzUxNWJmZiI+8J+TqTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPllPTkVYPC90ZXh0Pjwvc3ZnPg=='
    },
    { 
      id: 'grip-1', 
      name: 'Quấn cán Yonex AC102EX', 
      category: 'Phụ Kiện',
      price: 45000, 
      stock: 100,
      description: 'Độ bám tốt, thấm hút mồ hôi hiệu quả, mềm tay.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzgiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNzFiMWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDA1MDciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnOCkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzdkNmRmZiI+8J+TsTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlFVTjQgQ0FOPC90ZXh0Pjwvc3ZnPg=='
    },
    { 
      id: 'string-1', 
      name: 'Dây căng Yonex BG66 Ultimax', 
      category: 'Phụ Kiện',
      price: 120000, 
      stock: 40,
      description: 'Dây căng tốt, cảm giác đánh tốt, nảy cao.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzkiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNjFiMTciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDAwMDYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnOSkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VlOWMxMSI+8J+Tuw8vdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlNUUklORzwvdGV4dD48L3N2Zz4='
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Create initial knowledge posts
  const knowledgeData = [
    {
      id: 'knowledge-1',
      slug: 'bi-quyet-chon-vot',
      title: 'Bí quyết chọn vợt',
      desc: 'Phân tích lực tay, lối đánh và trọng lượng lý tưởng để chọn đúng vợt ngay từ đầu.',
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZTFlMmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiBmb250LXNpemU9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzliNTZmIj7wn5S/PC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LXdlaWdodD0iYm9sZCI+Vl9UX0M8L3RleHQ+PC9zdmc+',
      readTime: '6 phút',
      level: 'NEWBIE',
      sections: JSON.stringify([
        { heading: 'Trọng lượng & điểm cân bằng', body: 'Vợt nhẹ giúp xoay trở nhanh, phù hợp đánh đôi và lối chơi tốc độ. Vợt nặng hơn tăng lực đập nhưng yêu cầu thể lực và kỹ thuật. Điểm cân bằng (head-heavy/head-light) quyết định cảm giác và cách truyền lực.' },
        { heading: 'Độ cứng thân vợt', body: 'Thân cứng cho phản hồi nhanh, chính xác hơn nếu bạn có tốc độ vung tốt. Thân dẻo "trợ lực" cho người mới nhưng dễ bị thiếu ổn định nếu đánh mạnh.' },
        { heading: 'Căng dây & loại dây', body: 'Căng thấp dễ kiểm soát và đỡ mỏi tay; căng cao cho cảm giác "nảy" và điều cầu tốt hơn, nhưng kén kỹ thuật. Hãy tăng dần theo trình độ thay vì căng cao ngay.' }
      ])
    },
    {
      id: 'knowledge-2',
      slug: 'phan-loai-cau-tieu-chuan',
      title: 'Phân loại cầu tiêu chuẩn',
      desc: 'Độ bền, tốc độ và sự khác biệt giữa các loại cầu lông phổ biến.',
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTAxYjE3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDQwNzA1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzQpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3YmQxNGIiP/Cfk7M8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5DQUlMQU5HTzwvdGV4dD48L3N2Zz4=',
      readTime: '5 phút',
      level: 'NEWBIE',
      sections: JSON.stringify([
        { heading: 'Cầu lông vũ vs cầu nhựa', body: 'Cầu lông vũ cho quỹ đạo "thật" và cảm giác đánh tốt nhất nhưng chi phí cao hơn. Cầu nhựa bền, phù hợp luyện tập cơ bản hoặc chơi phong trào.' },
        { heading: 'Tốc độ cầu', body: 'Tốc độ cầu phụ thuộc nhiệt độ/độ cao. Trời lạnh cầu bay chậm hơn, thường chọn cầu nhanh hơn. Trời nóng cầu bay nhanh, chọn cầu chậm hơn để dễ kiểm soát.' },
        { heading: 'Mẹo tăng độ bền', body: 'Giữ cầu ở nơi mát, tránh gió nóng. Với cầu lông vũ, việc "dưỡng ẩm" đúng cách có thể giúp lông dai hơn và giảm gãy lông.' }
      ])
    },
    {
      id: 'knowledge-3',
      slug: 'ky-thuat-khoi-dong',
      title: 'Kỹ thuật khởi động',
      desc: 'Tránh chấn thương và tối ưu hiệu suất bằng quy trình khởi động đúng.',
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imc2IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTgxNTE1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDQwMDQwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzYpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNzE3MzYiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5HQUlIUzwvdGV4dD48L3N2Zz4=',
      readTime: '7 phút',
      level: 'INTERMEDIATE',
      sections: JSON.stringify([
        { heading: 'Kích hoạt toàn thân', body: 'Ưu tiên khớp cổ chân, gối, hông và vai. Thực hiện 5–8 phút bài động (dynamic) thay vì giãn tĩnh lâu ngay đầu buổi.' },
        { heading: 'Bài chuyên môn cầu lông', body: 'Shadow footwork (di chuyển không cầu), bước chéo, split step và các bài bật nhảy nhẹ giúp cơ thể vào nhịp trước khi vào game.' },
        { heading: 'Tăng dần cường độ', body: 'Đánh cầu nhẹ 2–3 phút, rồi tăng tốc/độ mạnh từ từ. Mục tiêu là tăng nhịp tim và nhiệt cơ, không phải "đốt sức" ngay.' }
      ])
    },
    {
      id: 'knowledge-4',
      slug: 'chien-thuat-danh-doi',
      title: 'Chiến thuật đánh đôi',
      desc: 'Cách di chuyển và phối hợp nhịp nhàng với đồng đội để kiểm soát thế trận.',
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imc5IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTYxYjE3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDQwNDA2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzkpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlZTljMTEiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5TVFJJTkc8L3RleHQ+PC9zdmc+',
      readTime: '8 phút',
      level: 'ADVANCED',
      sections: JSON.stringify([
        { heading: 'Đội hình trước–sau', body: 'Khi tấn công, ưu tiên đội hình trước–sau để người sau đập/điều cầu, người trước chặn và bắt lưới. Chuyển đổi nhanh khi mất thế.' },
        { heading: 'Đội hình trái–phải', body: 'Khi phòng thủ, trái–phải giúp phủ sân tốt. Ưu tiên trả cầu sâu và cao để lấy lại nhịp rồi chuyển sang phản công.' },
        { heading: 'Giao tiếp & phân chia khu vực', body: 'Thống nhất người bắt cầu giữa, ưu tiên kêu gọi rõ ràng. Một quyết định nhanh thường tốt hơn hai người do dự.' }
      ])
    },
  ];

  for (const k of knowledgeData) {
    await prisma.knowledge.upsert({
      where: { id: k.id },
      update: k,
      create: k,
    });
  }

  // Create lockers
  const lockersData = Array(20).fill(null).map((_, i) => ({
    id: `locker-${i + 1}`,
    number: String(i + 1).padStart(2, '0'),
    status: 'AVAILABLE' as const,
  }));

  for (const l of lockersData) {
    await prisma.locker.upsert({
      where: { id: l.id },
      update: {},
      create: l,
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
