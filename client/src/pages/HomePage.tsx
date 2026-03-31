import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { knowledgePosts } from './knowledge.data'

export function HomePage() {
  const user = useStore((s) => s.user)
  const bookings = useStore((s) => s.bookings)
  
  const recentCourts = user ? bookings
    .filter(b => b.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .map(b => b.courtId) : []

  return (
    <div className="w-full flex flex-col bg-app text-app gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 lg:pt-0">
        <div className="mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Real-time Court Booking
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] uppercase">
                Sân Đẹp <br />
                <span className="text-primary">Chốt Lịch Ngay</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg font-medium">
                Hệ thống đặt sân cầu lông chuyên nghiệp tích hợp công nghệ 3D. 
                Kiểm tra lịch trống và xác nhận đặt chỗ ngay lập tức.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/booking" className="btn-primary">Đặt Sân</Link>
              <Link to="/booking-3d" className="btn-secondary">Xem Sân 3D</Link>
            </div>

            {user && recentCourts.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Vừa đặt gần đây</div>
                <div className="flex flex-wrap gap-3">
                  {recentCourts.map((courtId, i) => (
                    <Link 
                      key={i}
                      to={`/booking?court=${courtId}`}
                      className="bg-white/5 px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all border border-white/5"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                        {courtId.split('-').pop()}
                      </div>
                      <div className="text-slate-200 text-xs font-bold uppercase">Sân {courtId.split('-').pop()}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50 transition-opacity group-hover:opacity-100" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2400&auto=format&fit=crop"
                alt="Badminton Professional Court" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/images/badminton-hero.svg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-40" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#020617] border border-white/10 p-5 rounded-2xl shadow-2xl">
              <div className="text-primary font-black text-2xl leading-none">ELYRA</div>
              <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Premium Arena</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-white/5">
          {[
            { icon: '⚡', title: 'Đặt Sân Siêu Tốc', desc: 'Quy trình đặt sân tối giản, hoàn tất chỉ trong vài lần chạm.' },
            { icon: '🗺️', title: 'Sơ Đồ 3D Trực Quan', desc: 'Dễ dàng lựa chọn vị trí sân mong muốn thông qua bản đồ 3D.' },
            { icon: '🛍️', title: 'Cửa Hàng Phụ Kiện', desc: 'Cung cấp đầy đủ dụng cụ cầu lông từ các thương hiệu hàng đầu.' },
          ].map((f, i) => (
            <div key={i} className={`p-10 space-y-4 hover:bg-white/[0.02] transition-colors ${i < 2 ? 'md:border-r border-white/5' : ''}`}>
              <div className="text-2xl grayscale group-hover:grayscale-0 transition-all">{f.icon}</div>
              <div className="text-white font-bold tracking-tight uppercase text-sm">{f.title}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge Section */}
      <section className="mx-auto max-w-7xl px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight">
              Kiến Thức <br />
              <span className="text-primary">& Kỹ Thuật</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Cập nhật những bí quyết và kỹ thuật từ các chuyên gia để nâng cao trình độ chơi cầu lông của bạn.
            </p>
            <div className="pt-2">
              <Link to="/knowledge" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                Xem tất cả bài viết <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {knowledgePosts.slice(0, 4).map((item) => (
              <Link
                key={item.slug}
                to={`/knowledge/${item.slug}`}
                className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all block"
              >
                <div className="aspect-[21/9] overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = "/images/badminton-hero.svg"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="text-primary font-bold text-xs uppercase tracking-wider mb-1.5">{item.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed line-clamp-2">{item.desc}</div>
                  <div className="mt-3 text-primary text-[10px] font-bold uppercase tracking-widest group-hover:underline">
                    Đọc tiếp →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
