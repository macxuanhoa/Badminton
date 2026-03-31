import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function AdminLayout() {
  const user = useStore((s) => s.user)
  const tabs = [
    { to: '/admin', label: 'Tổng quan', end: true },
    { to: '/admin/bookings', label: 'Booking' },
    { to: '/admin/orders', label: 'Đơn hàng' },
    { to: '/admin/products', label: 'Sản phẩm' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin/users', label: 'Người dùng' }] : []),
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="sticky top-[88px] z-[120] bg-[color:var(--app-bg)]/80 backdrop-blur-md border border-app rounded-2xl px-2 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={(t as any).end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-white/5'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}
