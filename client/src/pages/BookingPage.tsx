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
  const stepIndex = !zone ? 0 : !selectedCourt ? 1 : !selectedSlot ? 2 : 3
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({})
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [payErrors, setPayErrors] = useState<{ transfer?: string; cardNumber?: string; cardName?: string; cardExpiry?: string; cardCvc?: string }>({})
  const [paymentOpen, setPaymentOpen] = useState(false)

  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '')
  const digitsOnly = (v: string) => v.replace(/[^\d]/g, '')

  const luhnOk = (num: string) => {
    const s = digitsOnly(num)
    if (s.length < 13 || s.length > 19) return false
    let sum = 0
    let alt = false
    for (let i = s.length - 1; i >= 0; i--) {
      let n = Number(s[i])
      if (alt) {
        n *= 2
        if (n > 9) n -= 9
      }
      sum += n
      alt = !alt
    }
    return sum % 10 === 0
  }

  const expiryOk = (v: string) => {
    const m = v.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/)
    if (!m) return false
    const mm = Number(m[1])
    const yy = Number(m[2])
    if (mm < 1 || mm > 12) return false
    const now = new Date()
    const curYY = now.getFullYear() % 100
    const curMM = now.getMonth() + 1
    if (yy < curYY) return false
    if (yy === curYY && mm < curMM) return false
    return true
  }

  const transferQrSrc = '/thanhtoan/maqr.jpg'
  const transferBankName = 'MB Bank'
  const transferAccount = '0931440055'

  const handleBooking = async () => {
    if (!selectedCourt || !selectedSlot) return
    const next: { fullName?: string; phone?: string } = {}
    const name = form.fullName.trim()
    const phoneRaw = form.phone.trim()
    const phone = normalizePhone(phoneRaw)
    if (!name) next.fullName = 'Vui lòng nhập họ tên'
    if (!phone) next.phone = 'Vui lòng nhập số điện thoại'
    else if (phone.length < 9 || phone.length > 11) next.phone = 'Số điện thoại không hợp lệ'
    setErrors(next)
    const payNext: { transfer?: string; cardNumber?: string; cardName?: string; cardExpiry?: string; cardCvc?: string } = {}
    if (paymentMethod === 'TRANSFER') {
      if (!transferConfirmed) payNext.transfer = 'Vui lòng xác nhận đã chuyển khoản'
    }
    if (paymentMethod === 'CARD') {
      if (!luhnOk(card.number)) payNext.cardNumber = 'Số thẻ không hợp lệ'
      if (!card.name.trim()) payNext.cardName = 'Vui lòng nhập tên trên thẻ'
      if (!expiryOk(card.expiry)) payNext.cardExpiry = 'Hạn thẻ không hợp lệ (MM/YY)'
      const cvc = digitsOnly(card.cvc)
      if (cvc.length < 3 || cvc.length > 4) payNext.cardCvc = 'CVC không hợp lệ'
    }
    setPayErrors(payNext)
    if (Object.keys(next).length > 0 || Object.keys(payNext).length > 0) return
    try {
      const id = await createBooking({
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        fullName: name,
        phone,
        note: form.note.trim(),
        totalPrice: selectedSlot.price,
        paymentMethod,
      })
      setDoneId(id)
      selectCourt(null)
      setSelectedSlot(null)
      setStep('EXPLORE')
      setForm({ fullName: '', phone: '', note: '' })
      setTransferConfirmed(false)
      setCard({ number: '', name: '', expiry: '', cvc: '' })
      setPayErrors({})
      setNotification({ message: `Đặt sân thành công • Mã ${id.slice(0, 8).toUpperCase()}`, type: 'success' })
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
      className="mx-auto max-w-7xl px-6 py-6 flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-white font-bold text-3xl md:text-4xl tracking-tight leading-none">
            Hệ thống <span className="text-primary italic">Booking</span>
          </h1>
          <p className="text-gray-500 text-[11px] mt-1 font-medium opacity-80 uppercase tracking-widest">Đặt sân nhanh chóng • Trực quan • Tiện lợi</p>
        </div>
      </div>

      <div className="sticky top-[88px] z-[120] mb-6">
        <div className="glass rounded-3xl border-white/5 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-4 whitespace-nowrap">
              {['Zone', 'Sân', 'Giờ', 'XN'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === stepIndex ? 'bg-primary text-surface' : 'bg-white/10 text-gray-500'
                  }`}>{i + 1}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${i === stepIndex ? 'text-white' : 'text-gray-600'}`}>{label}</span>
                  {i < 3 && <div className="w-8 h-px bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/booking-3d"
            className="group relative px-3.5 py-2 rounded-2xl bg-primary text-surface font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-primary-hover shadow-lg shadow-primary-glow text-[10px] shrink-0"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-[11px]">🚀</span>
              <span className="hidden sm:inline">3D Hub</span>
              <span className="sm:hidden">3D</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          {!zone ? (
            <div className="glass rounded-3xl border-white/5 p-5 space-y-4">
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

        <div className="lg:col-span-8">
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
                            onChange={(e) => {
                              setForm((p) => ({ ...p, fullName: e.target.value }))
                              if (errors.fullName) setErrors((s) => ({ ...s, fullName: undefined }))
                            }}
                            className={`input-standard !py-2.5 !px-4 !text-xs ${errors.fullName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                            placeholder="Họ và tên"
                          />
                          {errors.fullName && (
                            <div className="mt-2 text-red-400 text-[9px] font-bold uppercase tracking-widest">{errors.fullName}</div>
                          )}
                        </div>
                        <div>
                          <input
                            value={form.phone}
                            onChange={(e) => {
                              setForm((p) => ({ ...p, phone: e.target.value }))
                              if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }))
                            }}
                            className={`input-standard !py-2.5 !px-4 !text-xs ${errors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                            placeholder="Số điện thoại"
                          />
                          {errors.phone && (
                            <div className="mt-2 text-red-400 text-[9px] font-bold uppercase tracking-widest">{errors.phone}</div>
                          )}
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
                            onClick={() => {
                              setPaymentMethod(m.id as any)
                              setPayErrors({})
                            }}
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
                      {paymentMethod !== 'CASH' && (
                        <button
                          type="button"
                          onClick={() => setPaymentOpen(true)}
                          className="btn-secondary w-full !py-3 !text-[10px]"
                        >
                          Nhập thông tin thanh toán
                        </button>
                      )}
                      {(paymentMethod === 'TRANSFER' && payErrors.transfer) && (
                        <div className="text-red-400 text-[9px] font-bold uppercase tracking-widest">{payErrors.transfer}</div>
                      )}
                    </div>
                    {paymentOpen && paymentMethod !== 'CASH' && (
                      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPaymentOpen(false)} />
                        <div className="relative glass-dark w-full max-w-xl rounded-[28px] border border-white/10 p-8 shadow-2xl">
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                              <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Payment</div>
                              <h2 className="text-white text-xl font-bold tracking-tight uppercase">
                                {paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
                              </h2>
                            </div>
                            <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => setPaymentOpen(false)}>
                              Đóng
                            </button>
                          </div>

                          {paymentMethod === 'TRANSFER' && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              <div className="md:col-span-5">
                                <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Quét mã</div>
                                <div className="mt-3 w-full aspect-square rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                                  <img src={transferQrSrc} alt="QR chuyển khoản" className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="md:col-span-7 space-y-4">
                                <div className="text-white font-bold">Thông tin</div>
                                <div className="space-y-3 text-[11px]">
                                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                                    <div className="text-muted font-bold uppercase tracking-widest text-[10px]">Ngân hàng</div>
                                    <div className="text-white font-bold">{transferBankName}</div>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                                    <div className="text-muted font-bold uppercase tracking-widest text-[10px]">STK</div>
                                    <div className="text-white font-mono font-bold">{transferAccount}</div>
                                  </div>
                                </div>
                                <label className="inline-flex items-center gap-3 text-[11px] font-semibold text-white pt-2">
                                  <input
                                    type="checkbox"
                                    checked={transferConfirmed}
                                    onChange={(e) => {
                                      setTransferConfirmed(e.target.checked)
                                      if (payErrors.transfer) setPayErrors((s) => ({ ...s, transfer: undefined }))
                                    }}
                                    className="w-4 h-4 rounded border border-white/20 bg-white/5"
                                  />
                                  Tôi đã chuyển khoản
                                </label>
                                {payErrors.transfer && (
                                  <div className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.transfer}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {paymentMethod === 'CARD' && (
                            <div className="space-y-4">
                              <div>
                                <label className="label-standard">Số thẻ</label>
                                <input
                                  value={card.number}
                                  onChange={(e) => {
                                    setCard((s) => ({ ...s, number: e.target.value }))
                                    if (payErrors.cardNumber) setPayErrors((s) => ({ ...s, cardNumber: undefined }))
                                  }}
                                  className={`input-standard ${payErrors.cardNumber ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                                  placeholder="1234 5678 9012 3456"
                                  inputMode="numeric"
                                />
                                {payErrors.cardNumber && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardNumber}</div>}
                              </div>
                              <div>
                                <label className="label-standard">Tên trên thẻ</label>
                                <input
                                  value={card.name}
                                  onChange={(e) => {
                                    setCard((s) => ({ ...s, name: e.target.value }))
                                    if (payErrors.cardName) setPayErrors((s) => ({ ...s, cardName: undefined }))
                                  }}
                                  className={`input-standard ${payErrors.cardName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                                  placeholder="NGUYEN VAN A"
                                />
                                {payErrors.cardName && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardName}</div>}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="label-standard">Hạn thẻ (MM/YY)</label>
                                  <input
                                    value={card.expiry}
                                    onChange={(e) => {
                                      setCard((s) => ({ ...s, expiry: e.target.value }))
                                      if (payErrors.cardExpiry) setPayErrors((s) => ({ ...s, cardExpiry: undefined }))
                                    }}
                                    className={`input-standard ${payErrors.cardExpiry ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                                    placeholder="MM/YY"
                                    inputMode="numeric"
                                  />
                                  {payErrors.cardExpiry && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardExpiry}</div>}
                                </div>
                                <div>
                                  <label className="label-standard">CVC</label>
                                  <input
                                    value={card.cvc}
                                    onChange={(e) => {
                                      setCard((s) => ({ ...s, cvc: e.target.value }))
                                      if (payErrors.cardCvc) setPayErrors((s) => ({ ...s, cardCvc: undefined }))
                                    }}
                                    className={`input-standard ${payErrors.cardCvc ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                                    placeholder="123"
                                    inputMode="numeric"
                                  />
                                  {payErrors.cardCvc && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardCvc}</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-6 flex justify-end gap-3">
                            <button type="button" className="btn-primary" onClick={() => setPaymentOpen(false)}>
                              Xong
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={!selectedSlot}
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
    </motion.div>
  )
}
