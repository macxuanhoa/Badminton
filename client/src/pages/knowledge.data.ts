export type KnowledgePost = {
  slug: string
  title: string
  desc: string
  img: string
  readTime: string
  level: 'NEWBIE' | 'INTERMEDIATE' | 'PRO'
  sections: { heading: string; body: string }[]
}

export const knowledgePosts: KnowledgePost[] = [
  {
    slug: 'bi-quyet-chon-vot',
    title: 'Bí quyết chọn vợt',
    desc: 'Phân tích lực tay, lối đánh và trọng lượng lý tưởng để chọn đúng vợt ngay từ đầu.',
    img: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1600&auto=format&fit=crop',
    readTime: '6 phút',
    level: 'NEWBIE',
    sections: [
      {
        heading: 'Trọng lượng & điểm cân bằng',
        body: 'Vợt nhẹ giúp xoay trở nhanh, phù hợp đánh đôi và lối chơi tốc độ. Vợt nặng hơn tăng lực đập nhưng yêu cầu thể lực và kỹ thuật. Điểm cân bằng (head-heavy/head-light) quyết định cảm giác và cách truyền lực.',
      },
      {
        heading: 'Độ cứng thân vợt',
        body: 'Thân cứng cho phản hồi nhanh, chính xác hơn nếu bạn có tốc độ vung tốt. Thân dẻo “trợ lực” cho người mới nhưng dễ bị thiếu ổn định nếu đánh mạnh.',
      },
      {
        heading: 'Căng dây & loại dây',
        body: 'Căng thấp dễ kiểm soát và đỡ mỏi tay; căng cao cho cảm giác “nảy” và điều cầu tốt hơn, nhưng kén kỹ thuật. Hãy tăng dần theo trình độ thay vì căng cao ngay.',
      },
    ],
  },
  {
    slug: 'phan-loai-cau-tieu-chuan',
    title: 'Phân loại cầu tiêu chuẩn',
    desc: 'Độ bền, tốc độ và sự khác biệt giữa các loại cầu lông phổ biến.',
    img: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=1600&auto=format&fit=crop',
    readTime: '5 phút',
    level: 'NEWBIE',
    sections: [
      {
        heading: 'Cầu lông vũ vs cầu nhựa',
        body: 'Cầu lông vũ cho quỹ đạo “thật” và cảm giác đánh tốt nhất nhưng chi phí cao hơn. Cầu nhựa bền, phù hợp luyện tập cơ bản hoặc chơi phong trào.',
      },
      {
        heading: 'Tốc độ cầu',
        body: 'Tốc độ cầu phụ thuộc nhiệt độ/độ cao. Trời lạnh cầu bay chậm hơn, thường chọn cầu nhanh hơn. Trời nóng cầu bay nhanh, chọn cầu chậm hơn để dễ kiểm soát.',
      },
      {
        heading: 'Mẹo tăng độ bền',
        body: 'Giữ cầu ở nơi mát, tránh gió nóng. Với cầu lông vũ, việc “dưỡng ẩm” đúng cách có thể giúp lông dai hơn và giảm gãy lông.',
      },
    ],
  },
  {
    slug: 'ky-thuat-khoi-dong',
    title: 'Kỹ thuật khởi động',
    desc: 'Tránh chấn thương và tối ưu hiệu suất bằng quy trình khởi động đúng.',
    img: 'https://images.unsplash.com/photo-1558365849-6ebb21c3f4df?q=80&w=1600&auto=format&fit=crop',
    readTime: '7 phút',
    level: 'INTERMEDIATE',
    sections: [
      {
        heading: 'Kích hoạt toàn thân',
        body: 'Ưu tiên khớp cổ chân, gối, hông và vai. Thực hiện 5–8 phút bài động (dynamic) thay vì giãn tĩnh lâu ngay đầu buổi.',
      },
      {
        heading: 'Bài chuyên môn cầu lông',
        body: 'Shadow footwork (di chuyển không cầu), bước chéo, split step và các bài bật nhảy nhẹ giúp cơ thể vào nhịp trước khi vào game.',
      },
      {
        heading: 'Tăng dần cường độ',
        body: 'Đánh cầu nhẹ 2–3 phút, rồi tăng tốc/độ mạnh từ từ. Mục tiêu là tăng nhịp tim và nhiệt cơ, không phải “đốt sức” ngay.',
      },
    ],
  },
  {
    slug: 'chien-thuat-danh-doi',
    title: 'Chiến thuật đánh đôi',
    desc: 'Cách di chuyển và phối hợp nhịp nhàng với đồng đội để kiểm soát thế trận.',
    img: 'https://images.unsplash.com/photo-1626225967045-9410dd993e41?q=80&w=1600&auto=format&fit=crop',
    readTime: '8 phút',
    level: 'PRO',
    sections: [
      {
        heading: 'Đội hình trước–sau',
        body: 'Khi tấn công, ưu tiên đội hình trước–sau để người sau đập/điều cầu, người trước chặn và bắt lưới. Chuyển đổi nhanh khi mất thế.',
      },
      {
        heading: 'Đội hình trái–phải',
        body: 'Khi phòng thủ, trái–phải giúp phủ sân tốt. Ưu tiên trả cầu sâu và cao để lấy lại nhịp rồi chuyển sang phản công.',
      },
      {
        heading: 'Giao tiếp & phân chia khu vực',
        body: 'Thống nhất người bắt cầu giữa, ưu tiên kêu gọi rõ ràng. Một quyết định nhanh thường tốt hơn hai người do dự.',
      },
    ],
  },
]

