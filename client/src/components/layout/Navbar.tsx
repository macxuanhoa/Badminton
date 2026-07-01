import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])
  
  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/booking', label: 'Đặt Sân' },
    { to: '/shop', label: 'Cửa Hàng' },
    { to: '/knowledge', label: 'Kiến Thức' },
    ...(user && (user.role === 'ADMIN' || user.role === 'STAFF') 
      ? [{ to: '/admin', label: 'Hệ Thống' }] 
      : []
    ),
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] border-b border-white/5 bg-[color:var(--surface-2)] backdrop-blur-xl h-[72px] flex items-center">
      <div className="mx-auto max-w-7xl px-4 md:px-6 w-full flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <span className="text-[#020617] text-base font-black italic">E</span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="uppercase tracking-tighter text-lg font-black text-white group-hover:text-primary transition-colors">ELYRA</span>
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Badminton</span>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to} 
              className={({ isActive }) => `
                px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative group
                ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-0 border border-primary/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-1/2 transition-all duration-300 rounded-full" />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-white text-[10px] font-black uppercase tracking-tight leading-none mb-1.5">{user.name}</div>
                <div className="text-primary text-[11px] font-black tracking-tighter leading-none">{user.walletBalance.toLocaleString()}đ</div>
              </div>
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10 hover:border-white/20"
                >
                  <span className="text-lg">⋯</span>
                </motion.button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-52 glass rounded-2xl border border-white/10 p-1.5 shadow-2xl z-[300]"
                    >
                      <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] mb-1.5">
                        <div className="text-white text-[11px] font-black uppercase tracking-widest truncate">{user.name}</div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="text-muted text-[9px] font-bold uppercase tracking-widest">{user.role}</div>
                          <div className="text-primary text-[10px] font-black">{user.walletBalance.toLocaleString()}đ</div>
                        </div>
                      </div>
                      <div className="h-px bg-white/5 my-1 mx-2" />
                      {user.role === 'USER' && (
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                          <span>👤</span> Hồ sơ
                        </Link>
                      )}
                      {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                          <span>⚙️</span> Hệ thống
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <span>🚪</span> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !py-2 !px-5 !text-[10px] !rounded-xl shadow-lg shadow-primary/20">
              ĐĂNG NHẬP
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[72px] z-[190] md:hidden bg-[#020617]/95 backdrop-blur-xl p-6"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all
                    ${isActive ? 'bg-primary text-[#020617]' : 'text-white bg-white/5'}
                  `}
                >
                  {link.label}
                  <span>→</span>
                </NavLink>
              ))}
              <div className="h-px bg-white/10 my-4" />
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-white/5"
              >
                Giao diện
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
