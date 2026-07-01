import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const img = (prompt: string, image_size: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${image_size}`;

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
      update: {
        ...c,
        status: 'AVAILABLE',
      },
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
  await prisma.product.deleteMany();

  const productsData = [
    { 
      id: 'racket-1', 
      name: 'Yonex Astrox 88D Pro', 
      category: 'Vợt Cầu Lông',
      price: 3850000, 
      stock: 5,
      description: 'Vợt thiên công, phù hợp người chơi có lực tay tốt, chuyên dùng cho tấn công mạnh mẽ.',
      tag: 'Best Seller',
      image: img('Professional product photo of a Yonex Astrox 88D Pro badminton racket on dark studio background, premium lighting, high detail, realistic', 'landscape_4_3'),
    },
    { 
      id: 'racket-2', 
      name: 'Lining Tectonic 7', 
      category: 'Vợt Cầu Lông',
      price: 3200000, 
      stock: 8,
      description: 'Vợt cân bằng, linh hoạt trong cả tấn công và phòng thủ, phù hợp mọi trình độ.',
      image: img('Realistic product photo of Li-Ning Tectonic 7 badminton racket, studio shot, clean dark background, premium lighting', 'landscape_4_3'),
    },
    { 
      id: 'racket-3', 
      name: 'Victor Thruster F Claw', 
      category: 'Vợt Cầu Lông',
      price: 4200000, 
      stock: 4,
      description: 'Vợt top đầu, thiết kế head-heavy, lực đập cực mạnh, dành cho người chơi tấn công.',
      tag: 'Hot',
      image: img('High-end product photo of Victor Thruster F Claw badminton racket on black background, dramatic lighting, ultra detailed', 'landscape_4_3'),
    },
    { 
      id: 'shuttle-1', 
      name: 'Cầu Thành Công (12 quả)', 
      category: 'Quả Cầu Lông',
      price: 220000, 
      stock: 50,
      description: 'Cầu lông vũ tiêu chuẩn thi đấu, độ bền cao, quỹ đạo ổn định.',
      tag: 'Hot',
      image: img('Realistic product photo of feather badminton shuttlecocks in a tube, studio shot, dark background, high detail', 'landscape_4_3'),
    },
    { 
      id: 'shuttle-2', 
      name: 'Cầu RSL Tourney Classic', 
      category: 'Quả Cầu Lông',
      price: 350000, 
      stock: 30,
      description: 'Cầu lông vũ chất lượng cao, dùng cho các giải đấu chuyên nghiệp.',
      image: img('Product photo of premium RSL badminton shuttlecock tube and shuttles, studio lighting, realistic, clean composition', 'landscape_4_3'),
    },
    { 
      id: 'shoes-1', 
      name: 'Victor P9200TTY', 
      category: 'Giày Cầu Lông',
      price: 2450000, 
      stock: 3,
      description: 'Phiên bản giới hạn Tai Tzu Ying, hỗ trợ di chuyển tối ưu, đệm Shock Absorption.',
      tag: 'New',
      image: img('Realistic product photo of Victor P9200 badminton shoes, studio shot, dark background, premium lighting, high detail', 'landscape_4_3'),
    },
    { 
      id: 'shoes-2', 
      name: 'Yonex SHB 65Z3', 
      category: 'Giày Cầu Lông',
      price: 2850000, 
      stock: 6,
      description: 'Giày cầu lông cao cấp, hỗ trợ nhanh nhẹ, bám sân tốt.',
      tag: 'Best Seller',
      image: img('Product photo of Yonex SHB 65Z3 badminton shoes, clean studio shot, realistic lighting, dark background', 'landscape_4_3'),
    },
    { 
      id: 'grip-1', 
      name: 'Quấn cán Yonex AC102EX', 
      category: 'Phụ Kiện',
      price: 45000, 
      stock: 100,
      description: 'Độ bám tốt, thấm hút mồ hôi hiệu quả, mềm tay.',
      image: img('Product photo of Yonex AC102EX overgrip rolls, studio shot, dark background, realistic, high detail', 'landscape_4_3'),
    },
    { 
      id: 'string-1', 
      name: 'Dây căng Yonex BG66 Ultimax', 
      category: 'Phụ Kiện',
      price: 120000, 
      stock: 40,
      description: 'Dây căng tốt, cảm giác đánh tốt, nảy cao.',
      image: img('Product photo of Yonex BG66 Ultimax badminton string package, studio shot, high detail, realistic lighting', 'landscape_4_3'),
    },
    {
      id: 'bag-1',
      name: 'Túi vợt Yonex Pro 6R',
      category: 'Túi - Balo',
      price: 1450000,
      stock: 12,
      description: 'Túi vợt 2 ngăn rộng rãi, chống thấm nhẹ, phù hợp mang 6 cây vợt và phụ kiện.',
      tag: 'New',
      image: img('Realistic product photo of Yonex badminton racket bag, black and green, studio shot, premium lighting', 'landscape_4_3'),
    },
    {
      id: 'bag-2',
      name: 'Balo Victor Team Backpack',
      category: 'Túi - Balo',
      price: 990000,
      stock: 15,
      description: 'Balo thể thao ngăn riêng giày, ngăn vợt và ngăn phụ kiện, form đứng hiện đại.',
      image: img('Product photo of a modern badminton backpack, studio shot, dark background, realistic, high detail', 'landscape_4_3'),
    },
    {
      id: 'shirt-1',
      name: 'Áo thi đấu Elyra Dry-Fit',
      category: 'Trang Phục',
      price: 289000,
      stock: 80,
      description: 'Áo thể thao co giãn nhẹ, thoáng khí, thấm hút nhanh, phù hợp chơi cầu lông cường độ cao.',
      tag: 'Best Seller',
      image: img('Realistic product photo of a premium black badminton jersey on hanger, studio shot, soft lighting', 'landscape_4_3'),
    },
    {
      id: 'shorts-1',
      name: 'Quần short Elyra Flex',
      category: 'Trang Phục',
      price: 259000,
      stock: 90,
      description: 'Quần short thể thao co giãn 4 chiều, có túi khóa, tối ưu di chuyển và bật nhảy.',
      image: img('Product photo of black athletic shorts, studio shot, realistic fabric texture, dark background', 'landscape_4_3'),
    },
    {
      id: 'socks-1',
      name: 'Vớ Yonex Cushion Crew',
      category: 'Trang Phục',
      price: 85000,
      stock: 120,
      description: 'Vớ dày đệm êm, giảm chấn, chống trượt, phù hợp chơi indoor.',
      image: img('Product photo of cushioned sports socks, studio shot, realistic, high detail', 'landscape_4_3'),
    },
    {
      id: 'brace-1',
      name: 'Bó gối thể thao LP Support',
      category: 'Bảo Hộ',
      price: 199000,
      stock: 40,
      description: 'Hỗ trợ khớp gối khi di chuyển nhanh, giảm nguy cơ chấn thương khi tập luyện.',
      tag: 'Hot',
      image: img('Realistic product photo of a sports knee support brace, studio shot, dark background, high detail', 'landscape_4_3'),
    },
    {
      id: 'brace-2',
      name: 'Bó cổ tay Aolikes',
      category: 'Bảo Hộ',
      price: 99000,
      stock: 70,
      description: 'Bảo vệ cổ tay, tăng ổn định khi đập và phòng thủ, chất liệu thấm hút tốt.',
      image: img('Product photo of wrist support bands, studio shot, realistic lighting, dark background', 'landscape_4_3'),
    },
    {
      id: 'accessory-1',
      name: 'Bình nước thể thao Elyra 800ml',
      category: 'Phụ Kiện',
      price: 159000,
      stock: 60,
      description: 'Bình nước nhựa Tritan an toàn, nắp chống rò, tiện mang theo khi luyện tập.',
      image: img('Product photo of a sleek sports water bottle, studio shot, dark background, premium lighting', 'landscape_4_3'),
    },
    {
      id: 'grip-2',
      name: 'Quấn cán Li-Ning GP1000',
      category: 'Phụ Kiện',
      price: 55000,
      stock: 120,
      description: 'Bề mặt bám tốt, giảm trơn khi ra mồ hôi, độ dày vừa phải dễ kiểm soát.',
      image: img('Product photo of badminton overgrip rolls, studio shot, high detail, dark background', 'landscape_4_3'),
    },
    {
      id: 'string-2',
      name: 'Dây căng Li-Ning No.1 Boost',
      category: 'Phụ Kiện',
      price: 135000,
      stock: 55,
      description: 'Dây trợ lực tốt, cảm giác nảy và bám cầu cao, phù hợp lối đánh tốc độ.',
      tag: 'New',
      image: img('Product photo of badminton string package, studio shot, realistic, premium lighting', 'landscape_4_3'),
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // Create initial knowledge posts
  await prisma.knowledge.deleteMany();

  const knowledgeData = [
    {
      id: 'knowledge-1',
      slug: 'bi-quyet-chon-vot',
      title: 'Bí quyết chọn vợt',
      desc: 'Phân tích lực tay, lối đánh và trọng lượng lý tưởng để chọn đúng vợt ngay từ đầu.',
      img: img('A badminton player choosing a racket in a modern pro shop, cinematic lighting, realistic photo, shallow depth of field', 'landscape_4_3'),
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
      img: img('Close-up photo of badminton shuttlecocks on a wooden court with soft stadium lighting, realistic, high detail', 'landscape_4_3'),
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
      img: img('Athlete doing dynamic warm-up on indoor badminton court, realistic sports photo, motion blur, cinematic lighting', 'landscape_4_3'),
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
      img: img('Two badminton doubles players coordinating on court, indoor stadium, realistic sports photo, dramatic lighting', 'landscape_4_3'),
      readTime: '8 phút',
      level: 'ADVANCED',
      sections: JSON.stringify([
        { heading: 'Đội hình trước–sau', body: 'Khi tấn công, ưu tiên đội hình trước–sau để người sau đập/điều cầu, người trước chặn và bắt lưới. Chuyển đổi nhanh khi mất thế.' },
        { heading: 'Đội hình trái–phải', body: 'Khi phòng thủ, trái–phải giúp phủ sân tốt. Ưu tiên trả cầu sâu và cao để lấy lại nhịp rồi chuyển sang phản công.' },
        { heading: 'Giao tiếp & phân chia khu vực', body: 'Thống nhất người bắt cầu giữa, ưu tiên kêu gọi rõ ràng. Một quyết định nhanh thường tốt hơn hai người do dự.' }
      ])
    },
    {
      id: 'knowledge-5',
      slug: 'footwork-co-ban',
      title: 'Footwork cơ bản: đi bước nào cho đúng',
      desc: 'Cách split-step, bước chéo và lùi sau để đón cầu nhanh hơn mà không tốn sức.',
      img: img('Badminton footwork training drill on indoor court, cones and athlete movement, realistic photo, high detail', 'landscape_4_3'),
      readTime: '7 phút',
      level: 'NEWBIE',
      sections: JSON.stringify([
        { heading: 'Split-step là nền tảng', body: 'Tập thói quen bật nhẹ (split-step) đúng thời điểm đối thủ chạm cầu để tăng phản xạ, chuyển hướng nhanh.' },
        { heading: 'Bước chéo & bước đệm', body: 'Đi bước chéo khi cần chuyển hướng xa, sau đó dùng bước đệm để chỉnh vị trí. Tránh chạy thẳng bằng nhiều bước nhỏ gây mất sức.' },
        { heading: 'Tập theo góc sân', body: 'Chia sân thành 6 điểm (4 góc + 2 biên giữa) và tập shadow 3–5 set, mỗi set 60–90s, nghỉ 30–45s.' },
      ]),
    },
    {
      id: 'knowledge-6',
      slug: 'cang-day-bao-nhieu-la-vua',
      title: 'Căng dây bao nhiêu là vừa?',
      desc: 'Chọn mức căng theo trình độ, thể lực và lối đánh để tránh đau tay và đứt dây sớm.',
      img: img('Close-up of badminton racket string bed and stringing machine, realistic workshop photo, high detail', 'landscape_4_3'),
      readTime: '6 phút',
      level: 'INTERMEDIATE',
      sections: JSON.stringify([
        { heading: 'Người mới: ưu tiên dễ kiểm soát', body: 'Mức căng thấp–trung bình giúp ít rung, dễ đánh bền. Tăng dần theo thời gian thay vì lên cao ngay.' },
        { heading: 'Trình độ khá: tối ưu cảm giác', body: 'Nếu bạn đã có kỹ thuật và lực cổ tay, căng cao hơn giúp điều cầu sắc và phản hồi nhanh.' },
        { heading: 'Dây mỏng vs dây dày', body: 'Dây mỏng cho cảm giác và tiếng nổ tốt nhưng dễ đứt. Dây dày bền hơn, phù hợp đánh phong trào.' },
      ]),
    },
    {
      id: 'knowledge-7',
      slug: 'dinh-duong-truoc-tran-dau',
      title: 'Dinh dưỡng trước trận: ăn gì để không hụt hơi',
      desc: 'Gợi ý bữa ăn nhẹ, nước điện giải và thời điểm nạp năng lượng trước khi vào sân.',
      img: img('Healthy sports nutrition meal and electrolyte drink on table, realistic photo, clean lighting, high detail', 'landscape_4_3'),
      readTime: '5 phút',
      level: 'NEWBIE',
      sections: JSON.stringify([
        { heading: 'Trước 60–120 phút', body: 'Ưu tiên carb dễ tiêu (chuối, bánh mì, yến mạch) và đủ nước. Tránh đồ nhiều dầu mỡ.' },
        { heading: 'Trong khi chơi', body: 'Uống từng ngụm nhỏ đều đặn. Nếu đánh lâu, dùng nước điện giải hoặc snack nhỏ.' },
        { heading: 'Sau trận', body: 'Bổ sung nước và protein vừa đủ giúp phục hồi cơ tốt hơn, giảm đau mỏi.' },
      ]),
    },
    {
      id: 'knowledge-8',
      slug: 'chan-thuong-thuong-gap',
      title: 'Chấn thương thường gặp & cách phòng tránh',
      desc: 'Cổ chân, gối, vai và khuỷu tay: nhận biết sớm và phòng tránh đúng cách.',
      img: img('Sports injury prevention concept on badminton court, ankle tape, knee brace, realistic photo, high detail', 'landscape_4_3'),
      readTime: '8 phút',
      level: 'ADVANCED',
      sections: JSON.stringify([
        { heading: 'Cổ chân & gối', body: 'Tập ổn định cổ chân (balance), tăng sức mạnh đùi và mông giúp giảm xoắn gối khi đổi hướng.' },
        { heading: 'Vai & khuỷu tay', body: 'Khởi động kỹ khớp vai, tăng cơ rotator cuff, tránh đập quá sức khi cơ thể chưa sẵn sàng.' },
        { heading: 'Giày & mặt sân', body: 'Chọn giày indoor bám tốt và đúng size. Mặt sân trơn làm tăng nguy cơ trượt và lật cổ chân.' },
      ]),
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
