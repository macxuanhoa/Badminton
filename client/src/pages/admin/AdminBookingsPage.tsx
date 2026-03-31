import { useEffect, useMemo } from 'react'
import { useStore } from '../../store/useStore'

export function AdminBookingsPage() {
  const bookings = useStore((s) => s.bookings)
  const fetchBookings = useStore((s) => s.fetchBookings)

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const rows = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [bookings])

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin</div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">Booking</h1>
        </div>
        <div className="text-muted text-[11px] font-medium">
          {rows.length} bản ghi
        </div>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr className="text-[10px] text-muted font-bold uppercase tracking-widest">
                <th className="px-4 py-3">Sân</th>
                <th className="px-4 py-3">Giờ</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Tổng</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((b) => (
                <tr key={b.id} className="text-[12px]">
                  <td className="px-4 py-3 text-white font-bold">{b.courtName}</td>
                  <td className="px-4 py-3 text-muted font-mono">{b.slotTime}</td>
                  <td className="px-4 py-3 text-white">{b.fullName}</td>
                  <td className="px-4 py-3 text-muted">{b.phone}</td>
                  <td className="px-4 py-3 text-muted">{b.paymentMethod}</td>
                  <td className="px-4 py-3 text-right text-white font-bold">{b.totalPrice.toLocaleString()}đ</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${
                      b.status === 'CONFIRMED' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-muted">
                    Chưa có booking nào.
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
