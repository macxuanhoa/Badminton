import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

type BookingForm = {
  fullName: string
  phone: string
  note: string
}

function buildSlots(basePrice: number) {
  return [
    { id: '05:00 - 06:00', time: '05:00 - 06:00', price: Math.round(basePrice * 0.6) },
    { id: '06:00 - 07:00', time: '06:00 - 07:00', price: Math.round(basePrice * 0.7) },
    { id: '17:00 - 18:00', time: '17:00 - 18:00', price: basePrice },
    { id: '18:00 - 19:00', time: '18:00 - 19:00', price: Math.round(basePrice * 1.2) },
    { id: '19:00 - 20:00', time: '19:00 - 20:00', price: Math.round(basePrice * 1.2) },
  ]
}

export function BookingPage() {
  const courts = useStore((s) => s.courts)
  const bookings = useStore((s) => s.bookings)
  const isLoading = useStore((s) => s.isLoading)
  const selectedCourtId = useStore((s) => s.selectedCourtId)
  const selectedSlot = useStore((s) => s.selectedSlot)
  const selectCourt = useStore((s) => s.selectCourt)
  const setStep = useStore((s) => s.setStep)
  const setSelectedSlot = useStore((s) => s.setSelectedSlot)
  const createBooking = useStore((s) => s.createBooking)

  const selectedCourt = useMemo(() => courts.find((c) => c.id === selectedCourtId) || null, [courts, selectedCourtId])
  
  const slots = useMemo(() => {
    if (!selectedCourt) return []
    const allSlots = buildSlots(selectedCourt.price)
    
    // Filter out already booked slots for this court today
    return allSlots.map(s => {
      const isBooked = bookings.some(b => 
        b.courtId === selectedCourt.id && 
        b.slotTime.includes(s.time) && 
        b.status !== 'CANCELLED'
      )
      return { ...s, isBooked }
    })
  }, [selectedCourt, bookings])

  const [form, setForm] = useState<BookingForm>({ fullName: '', phone: '', note: '' })
  const [doneId, setDoneId] = useState<string | null>(null)
  const setNotification = useStore((s) => s.setNotification)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH')
  const [zone, setZone] = useState<'BADMINTON' | 'PICKLEBALL' | 'TENNIS' | null>(null)

  const handleBooking = async () => {
    if (!selectedCourt || !selectedSlot) return
    try {
      const id = await createBooking({
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
        totalPrice: selectedSlot.price,
        paymentMethod,
      })
      setDoneId(id)
      selectCourt(null)
      setSelectedSlot(null)
      setStep('EXPLORE')
      setForm({ fullName: '', phone: '', note: '' })
      setNotification({ message: 'Đặt sân thành công!', type: 'success' })
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi đặt sân', type: 'error' })
    }
  }

  if (isLoading && courts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const zoneCourts = useMemo(() => {
    if (!zone) return []
    return courts.filter((c) => c.type === zone)
  }, [courts, zone])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-6 py-6 lg:min-h-[calc(100vh-72px)] flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-white font-bold text-3xl md:text-4xl tracking-tight leading-none">
            Hệ thống <span className="text-primary italic">Booking</span>
          </h1>
          <p className="text-gray-500 text-[11px] mt-1 font-medium opacity-80 uppercase tracking-widest">Đặt sân nhanh chóng • Trực quan • Tiện lợi</p>
        </div>
        <Link
          to="/booking-3d"
          className="group relative px-5 py-2.5 rounded-xl bg-primary text-surface font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-primary-hover shadow-lg shadow-primary-glow text-[10px] md:text-xs"
        >
          <span className="relative z-10 flex items-center gap-2">
            🚀 3D Interactive Hub
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!zone ? (
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Chọn khu vực</div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'BADMINTON', label: 'Badminton Zone', desc: 'Sân cầu lông tiêu chuẩn', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                  { key: 'PICKLEBALL', label: 'Pickleball Zone', desc: 'Sân pickleball tốc độ cao', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { key: 'TENNIS', label: 'Tennis Zone', desc: 'Sân tennis kích thước lớn', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                ].map((z) => (
                  <motion.button
                    key={z.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setZone(z.key as any)
                      setDoneId(null)
                      selectCourt(null)
                      setSelectedSlot(null)
                      setStep('EXPLORE')
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${z.bg} hover:bg-white/10`}
                  >
                    <div className={`text-[11px] font-black uppercase tracking-widest ${z.color}`}>{z.label}</div>
                    <div className="text-gray-500 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-80">{z.desc}</div>
                    <div className="text-gray-600 text-[9px] mt-2">
                      {courts.filter((c) => c.type === z.key).length} sân
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                  {zone === 'BADMINTON' ? 'Badminton' : zone === 'PICKLEBALL' ? 'Pickleball' : 'Tennis'} Zone
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setZone(null)
                    setDoneId(null)
                    selectCourt(null)
                    setSelectedSlot(null)
                    setStep('EXPLORE')
                  }}
                  className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Đổi zone
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {zoneCourts.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={c.status === 'AVAILABLE' ? { x: 4 } : {}}
                    whileTap={c.status === 'AVAILABLE' ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (c.status === 'BOOKED' || c.status === 'LOCKED') return
                      setDoneId(null)
                      selectCourt(c.id)
                      setStep('SELECT_COURT')
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition-all duration-200 ${
                      c.status === 'BOOKED'
                        ? 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed'
                        : selectedCourtId === c.id
                          ? 'bg-primary border-primary shadow-lg shadow-primary-glow text-surface'
                          : 'glass hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-bold text-sm tracking-tight ${selectedCourtId === c.id ? 'text-surface' : 'text-gray-100'}`}>
                          {c.name}
                        </div>
                        <div className={`text-[8px] font-bold uppercase mt-0.5 ${selectedCourtId === c.id ? 'text-surface/60' : 'text-gray-500'}`}>
                          {c.status === 'BOOKED' ? 'Đã được đặt' : 'Sẵn sàng'}
                        </div>
                      </div>
                      <div className={`font-bold text-xs ${selectedCourtId === c.id ? 'text-surface' : 'text-primary'}`}>
                        {c.price.toLocaleString()}đ
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!selectedCourt ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full glass rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="text-4xl mb-4 opacity-40">🏸</div>
                <h3 className="text-white font-bold text-base uppercase tracking-tight">
                  {zone ? 'Chọn sân để tiếp tục' : 'Chọn zone để bắt đầu'}
                </h3>
                <p className="text-gray-500 mt-2 max-w-[220px] text-[10px] leading-relaxed">
                  {zone ? 'Chọn sân ở bên trái hoặc chuyển sang chế độ 3D để xem trực quan.' : 'Chọn khu vực trước, sau đó hệ thống sẽ hiển thị danh sách sân phù hợp.'}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl border border-white/5 p-6 md:p-7 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg uppercase tracking-wider">
                    Chi tiết <span className="text-primary italic">Đặt sân</span>
                  </h3>
                  <button 
                    onClick={() => selectCourt(null)}
                    className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white hover:bg-red-500/10 hover:text-red-500 transition-all border-white/5 text-[10px]"
                  >✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="label-standard text-[9px]">Chọn Khung Giờ</label>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((s) => {
                          const isSelected = selectedSlot?.id === s.id
                          return (
                            <motion.button
                              key={s.id}
                              disabled={s.isBooked}
                              whileHover={!s.isBooked ? { scale: 1.02 } : {}}
                              whileTap={!s.isBooked ? { scale: 0.98 } : {}}
                              onClick={() => {
                                setDoneId(null)
                                setSelectedSlot({ id: s.id, time: s.time, price: s.price })
                                setStep('CONFIRM')
                              }}
                              className={`rounded-xl border p-2.5 text-left transition-all ${
                                s.isBooked
                                  ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                                  : isSelected 
                                    ? 'bg-primary text-surface border-primary shadow-lg shadow-primary-glow' 
                                    : 'bg-black/40 text-white border-white/5 hover:bg-black/60'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-sm">{s.time}</div>
                                {s.isBooked && <span className="text-[6px] bg-red-500/20 text-red-500 px-1 py-0.5 rounded uppercase font-black">Hết</span>}
                              </div>
                              <div className={`text-[8px] font-bold mt-0.5 ${isSelected ? 'text-surface/60' : 'text-gray-500'}`}>
                                {s.price.toLocaleString()}đ
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Giá tạm tính</span>
                        <span className="text-white font-bold text-xl tracking-tighter">{selectedSlot ? selectedSlot.price.toLocaleString() : '0'}đ</span>
                      </div>
                      <p className="text-gray-500 text-[8px] leading-relaxed opacity-60 italic">* Đã bao gồm dịch vụ & chiếu sáng.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="label-standard text-[9px]">Thông Tin Người Đặt</label>
                      <div className="space-y-2.5">
                        <div>
                          <input
                            value={form.fullName}
                            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                            className="input-standard !py-2.5 !px-4 !text-xs"
                            placeholder="Họ và tên"
                          />
                        </div>
                        <div>
                          <input
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                            className="input-standard !py-2.5 !px-4 !text-xs"
                            placeholder="Số điện thoại"
                          />
                        </div>
                        <div>
                          <textarea
                            value={form.note}
                            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                            className="input-standard min-h-[60px] !py-2 !px-4 !text-xs resize-none"
                            placeholder="Ghi chú thêm (không bắt buộc)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="label-standard text-[9px]">Thanh Toán</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'CASH', label: 'Tiền mặt' },
                          { id: 'TRANSFER', label: 'Chuyển khoản' },
                          { id: 'CARD', label: 'Thẻ' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`rounded-xl border p-2 text-center transition-all ${
                              paymentMethod === m.id
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-black/40 border-white/5 text-gray-400 hover:bg-black/60 hover:text-white'
                            }`}
                          >
                            <div className="text-[9px] font-bold uppercase tracking-widest">{m.label}</div>
                          </button>
                        ))}
                      </div>
                      <div className="text-gray-500 text-[9px] leading-relaxed">
                        {paymentMethod === 'CASH'
                          ? 'Thanh toán tại quầy khi đến sân.'
                          : paymentMethod === 'TRANSFER'
                            ? 'Chuyển khoản theo hướng dẫn sau khi đặt. Nhân viên sẽ xác nhận.'
                            : 'Quẹt thẻ tại quầy khi đến sân.'}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={!selectedSlot || !form.phone.trim()}
                      onClick={handleBooking}
                      className="btn-primary w-full py-3 shadow-xl text-xs"
                    >
                      XÁC NHẬN ĐẶT SÂN
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {doneId && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 glass p-5 rounded-xl border border-primary/30 text-primary font-bold text-sm shadow-2xl animate-pulse-slow"
        >
          ✓ Đặt sân thành công! Mã: {doneId.slice(0, 8).toUpperCase()}
        </motion.div>
      )}
    </motion.div>
  )
}
