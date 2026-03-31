import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'

export function AdminOrdersPage() {
  const user = useStore((s) => s.user)
  const orders = useStore((s) => s.orders)
  const fetchOrders = useStore((s) => s.fetchOrders)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!user) return
      setLoading(true)
      try {
        await fetchOrders()
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [user, fetchOrders])

  const rows = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders])

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin</div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">Đơn hàng</h1>
        </div>
        <div className="text-muted text-[11px] font-medium">
          {loading ? 'Đang tải...' : `${rows.length} bản ghi`}
        </div>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr className="text-[10px] text-muted font-bold uppercase tracking-widest">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Tổng</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((o) => (
                <tr key={o.id} className="text-[12px]">
                  <td className="px-4 py-3 text-muted font-mono">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-white">{o.guestName || 'Member'}</td>
                  <td className="px-4 py-3 text-muted">{o.guestPhone || '-'}</td>
                  <td className="px-4 py-3 text-muted">{o.paymentMethod || '-'}</td>
                  <td className="px-4 py-3 text-right text-white font-bold">{Number(o.total).toLocaleString()}đ</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
