import { NavLink, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function Navbar() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  
  const base = 'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 relative'
  const active = 'text-primary'
  const inactive = 'text-gray-400 hover:text-white'

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] border-b border-white/5 glass-dark">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-white font-bold tracking-tighter text-xl flex items-center gap-2 group">
          <div className="bg-primary w-9 h-9 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-primary-glow">
            <span className="text-surface text-base font-black italic">E</span>
          </div>
          <span className="hidden sm:inline uppercase tracking-tighter">ELYRA <span className="text-primary">HUB</span></span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {[
            { to: '/', label: 'Trang Chủ' },
            { to: '/booking', label: 'Đặt Sân' },
            { to: '/shop', label: 'Cửa Hàng' },
            { to: '/profile', label: 'Cá Nhân', hidden: !user },
            { to: '/admin', label: 'Vận Hành', hidden: user?.role !== 'ADMIN' },
          ].filter(l => !l.hidden).map((link) => (
            <NavLink 
              key={link.to}
              to={link.to} 
              className={({ isActive }) => `
                ${base} ${isActive ? active : inactive}
              `}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-white text-[10px] font-bold uppercase tracking-tight">{user.name}</div>
                  <div className="text-primary text-[9px] font-bold">{user.walletBalance.toLocaleString()}đ</div>
                </div>
                <button 
                  onClick={logout}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-red-500 transition-all border-white/5"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-2 !px-4 !text-[10px]">
                ĐĂNG NHẬP
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

