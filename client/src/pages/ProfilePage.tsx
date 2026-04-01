import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'

function TimeRemaining({ slotTime }: { slotTime?: string }) {
  const [remaining, setRemaining] = useState<string>('--:--')
  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'OVERTIME' | 'FINISHED'>('WAITING')

  useEffect(() => {
    if (!slotTime) return

    const timer = setInterval(() => {
      const [startStr, endStr] = slotTime.split(' - ')
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      const startTime = new Date(`${today}T${startStr}:00`).getTime()
      const endTime = new Date(`${today}T${endStr}:00`).getTime()
      const currentTime = now.getTime()

      if (currentTime < startTime) {
        setStatus('WAITING')
        const diff = startTime - currentTime
        const mins = Math.floor(diff / 60000)
        setRemaining(`Chờ ${mins}m`)
      } else if (currentTime < endTime) {
        setStatus('PLAYING')
        const diff = endTime - currentTime
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
      } else if (currentTime < endTime + 3600000) { // Show overtime for 1 hour
        setStatus('OVERTIME')
        setRemaining(`Hết giờ`)
      } else {
        setStatus('FINISHED')
        setRemaining(`Hoàn tất`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [slotTime])

  if (status === 'FINISHED') return null

  const colors = {
    WAITING: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    PLAYING: 'text-primary bg-primary/10 border-primary/20 animate-pulse',
    OVERTIME: 'text-red-500 bg-red-500/10 border-red-500/20',
    FINISHED: ''
  }

  return (
    <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold font-mono inline-block ${colors[status]}`}>
      {remaining}
    </div>
  )
}

export function ProfilePage() {
  const user = useStore((s) => s.user)
  const bookings = useStore((s) => s.bookings)
  const orders = useStore((s) => s.orders)
  const updateMe = useStore((s) => s.updateMe)
  const isLoading = useStore((s) => s.isLoading)
  const setNotification = useStore((s) => s.setNotification)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '')

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 font-bold uppercase tracking-widest">Vui lòng đăng nhập để xem thông tin</p>
      </div>
    )
  }

  useEffect(() => {
    setName(user.name || '')
    setPhone(user.phone || '')
    setAvatarUrl(user.avatarUrl)
  }, [user])

  const myBookings = bookings.filter(b => b.phone === user.phone || b.fullName === user.name)
  const myOrders = orders.filter(o => o.guestPhone === user.phone || o.guestName === user.name)

  const [showTopupModal, setShowTopupModal] = useState(false)
  const [topupAmount, setTopupAmount] = useState(100000)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-10 rounded-[40px] border-white/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-primary/15 border border-primary/20 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-primary text-4xl font-black italic">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{user.name || user.email}</h1>
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full border border-primary/20">
                {user.membership} MEMBER
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="glass-dark p-4 rounded-2xl border-white/5 relative group">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ví Elyra</div>
                  <div className="text-white font-bold">{user.walletBalance.toLocaleString()}đ</div>
                  <button 
                    onClick={() => setShowTopupModal(true)}
                    className="absolute top-2 right-2 px-2 py-1 bg-primary/20 text-primary text-[8px] font-bold rounded-lg uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Nạp
                  </button>
                </div>
                <div className="glass-dark p-4 rounded-2xl border-white/5 relative group">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Điểm tích lũy</div>
                  <div className="text-primary font-bold">{user.points} pts</div>
                  <button 
                    onClick={() => setNotification({ message: 'Tính năng đổi điểm đang được phát triển', type: 'success' })}
                    className="absolute top-2 right-2 px-2 py-1 bg-primary/20 text-primary text-[8px] font-bold rounded-lg uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Đổi
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[32px] border-white/5">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Thông tin tài khoản</h3>
            <div className="space-y-5">
              <div>
                <label className="label-standard">Email</label>
                <input value={user.email} disabled className="input-standard opacity-60 cursor-not-allowed" />
              </div>

              <div>
                <label className="label-standard">Họ và tên</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((s) => ({ ...s, name: undefined }))
                  }}
                  className={`input-standard ${errors.name ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                />
                {errors.name && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="label-standard">Số điện thoại</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }))
                  }}
                  className={`input-standard ${errors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  placeholder="Ví dụ: 090..."
                />
                {errors.phone && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.phone}</div>
                )}
              </div>

              <div>
                <label className="label-standard">Avatar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="input-standard !py-2.5"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 1024 * 1024) {
                        setNotification({ message: 'Avatar tối đa 1MB', type: 'error' })
                        return
                      }
                      const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(String(reader.result))
                        reader.onerror = () => reject(new Error('File read error'))
                        reader.readAsDataURL(file)
                      })
                      setAvatarUrl(dataUrl)
                    }}
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-2.5 !text-[10px]"
                      onClick={() => setAvatarUrl(undefined)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-primary w-full"
                disabled={isLoading}
                onClick={async () => {
                  try {
                    const next: { name?: string; phone?: string } = {}
                    const nameTrim = name.trim()
                    const phoneTrim = phone.trim()
                    const phoneNorm = phoneTrim ? normalizePhone(phoneTrim) : ''
                    if (!nameTrim) next.name = 'Vui lòng nhập họ tên'
                    if (phoneTrim && (phoneNorm.length < 9 || phoneNorm.length > 11)) next.phone = 'Số điện thoại không hợp lệ'
                    setErrors(next)
                    if (Object.keys(next).length > 0) return
                    await updateMe({ name: nameTrim, phone: phoneNorm || undefined, avatarUrl })
                    setNotification({ message: 'Đã cập nhật tài khoản', type: 'success' })
                  } catch (e: any) {
                    setNotification({ message: e.message || 'Lỗi cập nhật', type: 'error' })
                  }
                }}
              >
                {isLoading ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Lịch sử đặt sân
            </h2>
            <div className="space-y-4">
              {myBookings.length === 0 ? (
                <div className="glass p-12 rounded-3xl border-dashed border-white/10 text-center text-gray-500 italic text-sm">
                  Bạn chưa có lịch đặt sân nào.
                </div>
              ) : (
                myBookings.map((b) => (
                  <div key={b.id} className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/5">
                        🏸
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="text-white font-bold text-lg">{b.courtName}</div>
                          {b.status === 'CONFIRMED' && <TimeRemaining slotTime={b.slotTime} />}
                        </div>
                        <div className="text-gray-500 text-xs font-mono">{b.slotTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trạng thái</div>
                        <div className={`text-xs font-bold mt-1 ${
                          b.status === 'CONFIRMED' ? 'text-primary' : 'text-red-500'
                        }`}>
                          {b.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Thanh toán</div>
                        <div className="text-white font-bold mt-1">{b.totalPrice.toLocaleString()}đ</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Đơn mua hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.length === 0 ? (
                <div className="col-span-2 glass p-12 rounded-3xl border-dashed border-white/10 text-center text-gray-500 italic text-sm">
                  Bạn chưa có đơn hàng nào.
                </div>
              ) : (
                myOrders.map((o) => (
                  <div key={o.id} className="glass p-6 rounded-3xl border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="text-[10px] font-mono text-gray-500 uppercase">#{o.id.slice(0, 8)}</div>
                      <div className="text-primary font-bold text-sm">{o.total.toLocaleString()}đ</div>
                    </div>
                    <div className="space-y-2">
                      {o.items.map((it, i) => (
                        <div key={i} className="text-xs text-gray-400 flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg inline-block ${
                      o.status === 'DELIVERED' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {o.status === 'DELIVERED' ? 'Đã giao hàng' : 'Đang xử lý'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTopupModal(false)} />
          <div className="relative glass-dark w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-white font-bold text-xl tracking-tight uppercase">Nạp Tiền Vào Ví</h2>
               <button onClick={() => setShowTopupModal(false)} className="text-gray-500 hover:text-white transition-all text-xl">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="label-standard">Chọn số tiền</label>
                <div className="grid grid-cols-3 gap-3">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        topupAmount === amt ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {amt.toLocaleString()}đ
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <button
                  className="btn-primary w-full !py-4"
                  onClick={() => {
                    useStore.getState().updateWallet(topupAmount)
                    setNotification({ message: `Đã nạp ${topupAmount.toLocaleString()}đ vào ví thành công!`, type: 'success' })
                    setShowTopupModal(false)
                  }}
                >
                  Xác nhận nạp {topupAmount.toLocaleString()}đ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
