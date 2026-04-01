import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function Navbar() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const el = menuRef.current
      if (!el) return
      if (!(e.target instanceof Node)) return
      if (!el.contains(e.target)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])
  
  const base = 'px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 relative'
  const active = 'text-primary bg-primary/5'
  const inactive = 'text-slate-400 hover:bg-white/5'

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] border-b border-app bg-[color:var(--surface-2)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-between">
        <NavLink to="/" className="text-app font-bold tracking-tight text-lg flex items-center gap-2.5 group">
          <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center transition-transform shadow-sm">
            <span className="text-[#020617] text-sm font-black italic">E</span>
          </div>
          <span className="hidden sm:inline uppercase tracking-tight text-base font-black">ELYRA <span className="text-primary font-medium">HUB</span></span>
        </NavLink>
        <nav className="flex items-center gap-1.5">
          {[
            { to: '/', label: 'Trang Chủ' },
            { to: '/booking', label: 'Đặt Sân' },
            { to: '/shop', label: 'Cửa Hàng' },
            { to: '/knowledge', label: 'Kiến Thức' },
          ].map((link) => (
            <NavLink 
              key={link.to}
              to={link.to} 
              className={({ isActive }) => `
                ${base} ${isActive ? active : inactive}
              `}
            >
              {link.label}
            </NavLink>
          ))}
          
          <div className="ml-3 pl-3 border-l border-white/10 flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-app hover:bg-white/10 transition-all"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-app text-[10px] font-bold uppercase tracking-tight leading-none mb-1">{user.name}</div>
                  <div className="text-primary text-[9px] font-medium leading-none">{user.walletBalance.toLocaleString()}đ</div>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
                    aria-label="Menu"
                  >
                    <span className="text-[12px] leading-none">⋯</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 glass rounded-2xl border border-white/10 p-1 shadow-2xl">
                      <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="text-white text-[10px] font-bold uppercase tracking-widest truncate">
                          {user.name || user.email}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="text-muted text-[9px] font-bold uppercase tracking-widest">{user.role}</div>
                          <div className="text-primary text-[9px] font-bold">{user.walletBalance.toLocaleString()}đ</div>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      {user.role === 'USER' && (
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-white/5"
                        >
                          Hồ sơ
                        </Link>
                      )}
                      {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-white/5"
                        >
                          Vận hành
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          logout()
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-300 hover:bg-white/5"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-1.5 !px-3.5 !text-[10px] rounded-md">
                ĐĂNG NHẬP
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
