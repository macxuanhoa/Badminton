import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'

export function HomePage() {
  const user = useStore((s) => s.user)
  const bookings = useStore((s) => s.bookings)
  
  // Find last 2 unique courts the user has booked
  const recentCourts = user ? bookings
    .filter(b => b.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .map(b => b.courtId) : []

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full" />
        </div>

        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="max-w-3xl">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Real-time Court Booking
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] uppercase">
                  Đặt Sân <br />
                  <span className="text-primary italic">Trong 10 Giây</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                  Hệ thống đặt sân chuyên nghiệp với công nghệ 3D Interactive. 
                  Kiểm tra lịch trống thời gian thực và xác nhận ngay lập tức.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Link
                  to="/booking"
                  className="btn-primary px-10 py-5 text-base"
                >
                  Đặt Sân Ngay
                </Link>
                <Link
                  to="/booking-3d"
                  className="btn-secondary px-10 py-5 text-base border-white/10"
                >
                  Trải Nghiệm 3D
                </Link>
              </div>

              {/* Quick Re-book for Returning Users */}
              {user && recentCourts.length > 0 && (
                <div className="pt-8 border-t border-white/5">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Đặt lại nhanh</div>
                  <div className="flex flex-wrap gap-4">
                    {recentCourts.map((courtId, i) => (
                      <Link 
                        key={i}
                        to={`/booking?court=${courtId}`}
                        className="glass px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all border-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {courtId.split('-').pop()}
                        </div>
                        <div className="text-white text-sm font-bold tracking-tight">Sân {courtId.split('-').pop()}</div>
                        <span className="text-gray-600 text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Section - Moved & Deprioritized */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Kiến Thức <br /><span className="text-primary">& Kỹ Thuật</span></h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Cập nhật những bí quyết và kỹ thuật từ các chuyên gia để nâng cao trình độ chơi cầu lông của bạn.
            </p>
            <div className="pt-4">
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                Xem tất cả bài viết →
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Bí quyết chọn vợt phù hợp', desc: 'Phân tích lực tay, lối đánh và trọng lượng lý tưởng.' },
              { title: 'Phân loại cầu tiêu chuẩn', desc: 'Độ bền, tốc độ và sự khác biệt giữa cầu lông vũ & nhựa.' },
              { title: 'Kỹ thuật khởi động PRO', desc: 'Tránh chấn thương và tối ưu hiệu suất thi đấu.' },
              { title: 'Chiến thuật đánh đôi', desc: 'Cách di chuyển và phối hợp nhịp nhàng với đồng đội.' },
            ].map((item, i) => (
              <div key={i} className="glass-card bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-primary font-bold text-sm uppercase tracking-wider mb-2">{item.title}</div>
                <div className="text-gray-400 text-sm leading-relaxed opacity-70 mb-4">{item.desc}</div>
                <button className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                  Đọc thêm
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Added for Product Credibility */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '⚡', title: 'Đặt Sân Siêu Tốc', desc: 'Quy trình đặt sân tối giản, hoàn tất chỉ trong vài lần chạm.' },
            { icon: '🗺️', title: 'Sơ Đồ 3D Trực Quan', desc: 'Dễ dàng lựa chọn vị trí sân mong muốn thông qua bản đồ 3D.' },
            { icon: '🛍️', title: 'Cửa Hàng Phụ Kiện', desc: 'Cung cấp đầy đủ dụng cụ cầu lông từ các thương hiệu hàng đầu.' },
          ].map((f, i) => (
            <div key={i} className="p-8 border-l border-white/5 space-y-4 hover:bg-white/[0.02] transition-colors">
              <div className="text-3xl">{f.icon}</div>
              <div className="text-white font-bold tracking-tight uppercase">{f.title}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

