import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { knowledgePosts } from './knowledge.data'
import { motion } from 'framer-motion'

export function HomePage() {
  const user = useStore((s) => s.user)
  const bookings = useStore((s) => s.bookings)
  
  const recentCourts = user ? bookings
    .filter(b => b.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .map(b => b.courtId) : []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col bg-app text-app gap-12 md:gap-32 pb-12 md:pb-32"
    >
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center pt-12 lg:pt-0 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div variants={itemVariants} className="space-y-8 md:space-y-10 z-10">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Hệ thống đặt sân thời gian thực
              </motion.div>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                Sân Đẹp <br />
                <span className="text-primary italic">Chốt Lịch Ngay</span>
              </h1>
              <p className="text-slate-400 text-base md:text-xl leading-relaxed max-w-lg font-medium opacity-80">
                Trải nghiệm đặt sân cầu lông hiện đại với công nghệ 3D trực quan. 
                Nhanh chóng, minh bạch và chuyên nghiệp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link to="/booking" className="group relative px-8 py-4 bg-primary text-[#020617] font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 uppercase tracking-tighter">
                Đặt Sân Ngay
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link to="/booking-3d" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-white/10 uppercase tracking-tighter">
                Khám phá không gian 3D
              </Link>
            </div>

            {user && recentCourts.length > 0 && (
              <motion.div variants={itemVariants} className="pt-8 border-t border-white/5">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Hoạt động gần đây</div>
                <div className="flex flex-wrap gap-3">
                  {recentCourts.map((courtId, i) => (
                    <Link 
                      key={i}
                      to={`/booking?court=${courtId}`}
                      className="bg-white/5 px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all border border-white/5 hover:border-primary/30 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs group-hover:scale-110 transition-transform">
                        {courtId.split('-').pop()}
                      </div>
                      <div className="text-slate-200 text-[11px] font-black uppercase tracking-tight">Sân {courtId.split('-').pop()}</div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="relative group w-full"
          >
            <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full opacity-30 animate-pulse" />
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900 w-full group-hover:border-primary/30 transition-colors duration-500">
              <img 
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=2070"
                alt="Badminton Professional Court" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/images/badminton-hero.svg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Sân đang mở</span>
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -right-6 bg-[#020617] border border-white/10 p-6 rounded-[32px] shadow-2xl hidden lg:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">🏸</div>
                <div>
                  <div className="text-primary font-black text-2xl leading-none tracking-tighter italic">ELYRA HUB</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">Tiêu chuẩn quốc tế</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 border-y border-white/5">
          {[
            { icon: '⚡', title: 'Đặt Sân Siêu Tốc', desc: 'Quy trình đặt sân tối giản, hoàn tất chỉ trong vài lần chạm.' },
            { icon: '🗺️', title: 'Sơ Đồ 3D Trực Quan', desc: 'Dễ dàng lựa chọn vị trí sân mong muốn thông qua bản đồ 3D.' },
            { icon: '🛍️', title: 'Cửa Hàng Phụ Kiện', desc: 'Cung cấp đầy đủ dụng cụ cầu lông từ các thương hiệu hàng đầu.' },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className={`p-8 md:p-12 space-y-6 transition-colors group ${i < 2 ? 'md:border-r border-white/5' : ''}`}
            >
              <div className="text-4xl md:text-5xl transition-transform group-hover:scale-110 duration-500">{f.icon}</div>
              <div className="space-y-3">
                <div className="text-white font-black tracking-tight uppercase text-lg">{f.title}</div>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Knowledge Section */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 items-start">
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                Kiến Thức <br />
                <span className="text-primary italic">& Kỹ Thuật</span>
              </h2>
              <div className="w-20 h-1.5 bg-primary rounded-full" />
            </div>
            <p className="text-slate-500 text-base leading-relaxed font-medium">
              Cập nhật những bí quyết và kỹ thuật từ các chuyên gia để nâng cao trình độ chơi cầu lông của bạn.
            </p>
            <div className="pt-2">
              <Link to="/knowledge" className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-[#020617] transition-all">
                Xem tất cả bài viết
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </motion.div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {knowledgePosts.slice(0, 4).map((item, i) => (
              <motion.div key={item.slug} variants={itemVariants}>
                <Link
                  to={`/knowledge/${item.slug}`}
                  className="group bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all duration-500 block h-full"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      onError={(e) => {
                        e.currentTarget.src = "/images/badminton-hero.svg"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-8">
                    <div className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-3">{item.title}</div>
                    <h3 className="text-white font-bold text-lg mb-4 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium mb-6">{item.desc}</div>
                    <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                      Đọc tiếp <span>→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}
