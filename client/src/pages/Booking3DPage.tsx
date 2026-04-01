import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Scene } from '../components/3d/Scene'
import { socketService } from '../services/socket.service'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export function Booking3DPage() {
  const currentStep = useStore((s) => s.currentStep)
  const courts = useStore((s) => s.courts)
  const selectedCourtId = useStore((s) => s.selectedCourtId)
  const selectedSlot = useStore((s) => s.selectedSlot)
  const selectedDate = useStore((s) => s.selectedDate)
  const setSelectedDate = useStore((s) => s.setSelectedDate)
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const setStep = useStore((s) => s.setStep)
  const selectCourt = useStore((s) => s.selectCourt)
  const setSelectedSlot = useStore((s) => s.setSelectedSlot)
  const createBooking = useStore((s) => s.createBooking)
  const fetchBookings = useStore((s) => s.fetchBookings)
  const updatePresence = useStore(s => s.updatePresence)
  const usersOnline = useStore(s => s.usersOnline)
  const [webglError, setWebglError] = useState<string | null>(null)

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setWebglError('Trình duyệt của bạn không hỗ trợ WebGL. Vui lòng sử dụng bản 2D hoặc cập nhật trình duyệt.')
    }
    
    fetchBookings()
  }, [fetchBookings])

  const selectedCourt = useMemo(() => courts.find((c) => c.id === selectedCourtId) || null, [courts, selectedCourtId])
  const user = useStore((s) => s.user)
  const [fullName, setFullName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])
  const [note, setNote] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH')
  const [zoneFilter, setZoneFilter] = useState<'BADMINTON' | 'PICKLEBALL' | 'TENNIS' | null>(null)
  const setNotification = useStore((s) => s.setNotification)
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({})
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [payErrors, setPayErrors] = useState<{ transfer?: string; cardNumber?: string; cardName?: string; cardExpiry?: string; cardCvc?: string }>({})
  const [paymentOpen, setPaymentOpen] = useState(false)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const logout = useStore((s) => s.logout)
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

  const steps = useMemo(() => (['EXPLORE', 'SELECT_COURT', 'CHOOSE_TIME', 'CONFIRM'] as const), [])
  const stepIndex = useMemo(() => {
    const idx = steps.indexOf(currentStep as any)
    return idx >= 0 ? idx : 0
  }, [steps, currentStep])

  const groupedCourts = useMemo(() => {
    return courts.reduce((acc, c) => {
      if (!acc[c.type]) acc[c.type] = []
      acc[c.type].push(c)
      return acc
    }, {} as Record<string, typeof courts>)
  }, [courts])

  useEffect(() => {
    socketService.connect()
    return () => socketService.disconnect()
  }, [])

  useEffect(() => {
    if (selectedCourt) {
      setZoneFilter(selectedCourt.type as any)
    }
  }, [selectedCourt])

  useEffect(() => {
    setViewMode('OVERVIEW')
  }, [setViewMode])

  useEffect(() => {
    if (!selectedCourtId) {
      setFullName('')
      setPhone('')
      setNote('')
      setDoneId(null)
    }
  }, [selectedCourtId])

  const total = selectedSlot?.price || selectedCourt?.price || 0
  const transferQrSrc = '/thanhtoan/maqr.jpg'
  const transferBankName = 'MB Bank'
  const transferAccount = '0931440055'

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617]">
      {webglError && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest">Lỗi đồ họa</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{webglError}</p>
            <Link to="/booking" className="btn-primary inline-block">Chuyển sang bản 2D</Link>
          </div>
        </div>
      )}
      <Scene />

      <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-[260] pointer-events-auto">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-4">
          <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-3">
            <Link
              to="/booking"
              className="group relative px-4 md:px-5 py-2 md:py-3 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold uppercase tracking-widest overflow-hidden transition-all border border-white/10 text-[10px] md:text-[11px] shadow-2xl backdrop-blur-md flex items-center gap-2 md:gap-3"
            >
              <span>←</span>
              <span className="hidden sm:inline">2D Mode</span>
              <span className="sm:hidden">2D</span>
            </Link>
            <div className="bg-[#020617] px-4 md:px-5 py-2 md:py-3 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-2 md:gap-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary-glow/40 animate-pulse" />
              <span className="text-primary font-black uppercase tracking-widest text-[10px] md:text-[11px]">3D Hub</span>
              <span className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hidden sm:inline">({usersOnline} Live)</span>
            </div>
            
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border glass border-white/10 text-gray-300 hover:bg-white/5"
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
          </div>

          <div className="flex w-full md:w-auto justify-center items-center gap-2 md:gap-4 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <div className="bg-[#020617] px-3 md:px-4 py-2 md:py-3 rounded-2xl border border-white/5 flex items-center gap-2 md:gap-4 backdrop-blur-md shadow-2xl shrink-0">
              {['Khám phá', 'Chọn sân', 'Chọn giờ', 'Xác nhận'].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold ${
                      i === stepIndex ? 'bg-primary text-surface' : 'bg-white/10 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${i === stepIndex ? 'text-white' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  {i < 3 && <div className="w-2 md:w-4 h-px bg-white/10" />}
                </div>
              ))}
            </div>
            
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#020617] border border-white/10 text-white rounded-2xl px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-[11px] font-bold focus:outline-none focus:border-primary/50 shadow-2xl backdrop-blur-md shrink-0"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="hidden md:flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border glass border-white/10 text-gray-300 hover:bg-white/5"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            {user && (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setNotification({ message: 'Đã đăng xuất', type: 'success' })
                }}
                className="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border glass border-white/10 text-gray-300 hover:bg-white/5"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-8 left-8 z-[250] pointer-events-auto hidden md:block">
        <div className="glass p-5 rounded-3xl w-44 h-60 relative overflow-hidden border-white/5">
          <div className="text-[10px] font-bold uppercase text-gray-500 absolute top-3 left-5 tracking-widest opacity-60">
            Facility Map
          </div>

          <div
            className="w-full h-full mt-6 rounded-2xl border border-white/5 bg-black/30 p-3 flex flex-col gap-3"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              backgroundPosition: 'center',
            }}
          >
            {!zoneFilter ? (
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[180px]">
                <div className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-500 opacity-90">
                  Tất cả các sân
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {courts.map((c) => {
                    const isSelected = selectedCourtId === c.id
                    const isDisabled = c.status === 'LOCKED' || c.status === 'MAINTENANCE'
                    const isBooked = c.status === 'BOOKED'
                    const number = c.name.split(' ').pop()

                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isBooked || isDisabled) return
                          setDoneId(null)
                          selectCourt(c.id)
                          setStep('SELECT_COURT')
                          setZoneFilter(c.type as any)
                        }}
                        className={`rounded-md border text-left px-2 py-1 transition-all ${
                          isBooked
                            ? 'bg-red-500/15 border-red-500/20 text-red-200/70 opacity-80'
                            : isDisabled
                              ? 'bg-white/5 border-white/10 text-gray-500 opacity-60'
                              : isSelected
                                ? 'bg-primary/25 border-primary text-primary'
                                : 'bg-primary/10 border-primary/20 text-primary/80'
                        }`}
                      >
                        <div className="text-[8px] font-black leading-none">C.{number}</div>
                        <div className="text-[6px] font-bold opacity-70 mt-0.5 leading-none">
                          {c.type[0]}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
                
                <div className="pt-2 border-t border-white/5">
                  <div className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-500 opacity-90 mb-2">
                    Lọc theo Zone
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'BADMINTON', label: 'Badminton', color: 'text-primary', border: 'border-primary/20 bg-primary/10' },
                      { key: 'PICKLEBALL', label: 'Pickleball', color: 'text-blue-400', border: 'border-blue-500/20 bg-blue-500/10' },
                      { key: 'TENNIS', label: 'Tennis', color: 'text-orange-400', border: 'border-orange-500/20 bg-orange-500/10' },
                    ].map((z) => (
                      <button
                        key={z.key}
                        type="button"
                        onClick={() => setZoneFilter(z.key as any)}
                        className={`rounded-xl border p-2 text-left transition-all hover:bg-white/10 ${z.border}`}
                      >
                        <div className={`text-[9px] font-black uppercase tracking-widest ${z.color}`}>{z.label}</div>
                        <div className="text-[8px] text-gray-600 mt-1">{courts.filter((c) => c.type === z.key).length} sân</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-[8px] font-black uppercase tracking-[0.25em] opacity-90 ${
                      zoneFilter === 'BADMINTON' ? 'text-primary' : zoneFilter === 'PICKLEBALL' ? 'text-blue-400' : 'text-orange-400'
                    }`}
                  >
                    {zoneFilter === 'BADMINTON' ? 'Badminton' : zoneFilter === 'PICKLEBALL' ? 'Pickleball' : 'Tennis'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setZoneFilter(null)
                      selectCourt(null)
                      setSelectedSlot(null)
                      setStep('EXPLORE')
                    }}
                    className="text-primary text-[8px] font-black uppercase tracking-widest hover:underline"
                  >
                    Đổi
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {(groupedCourts[zoneFilter] || []).map((c) => {
                    const isSelected = selectedCourtId === c.id
                    const isDisabled = c.status === 'LOCKED' || c.status === 'MAINTENANCE'
                    const isBooked = c.status === 'BOOKED'
                    const number = c.name.split(' ').pop()

                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        title={`${c.name} • ${c.price.toLocaleString()}đ • ${isBooked ? 'Occupied' : isDisabled ? 'Disabled' : 'Available'}`}
                        whileHover={!isBooked && !isDisabled ? { scale: 1.03 } : {}}
                        whileTap={!isBooked && !isDisabled ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (isBooked || isDisabled) return
                          setDoneId(null)
                          selectCourt(c.id)
                          setStep('SELECT_COURT')
                        }}
                        className={`rounded-md border text-left px-2 py-1.5 transition-all ${
                          isBooked
                            ? 'bg-red-500/15 border-red-500/20 text-red-200/70 opacity-80 cursor-not-allowed'
                            : isDisabled
                              ? 'bg-white/5 border-white/10 text-gray-500 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'bg-primary/25 border-primary text-primary shadow-sm shadow-primary-glow/20'
                                : 'bg-primary/10 border-primary/20 text-primary/80 hover:bg-primary/15'
                        }`}
                      >
                        <div className="text-[9px] font-black leading-none">Court {number}</div>
                        <div className="text-[7px] font-bold opacity-70 mt-1 leading-none">
                          {isBooked ? 'Occupied' : isDisabled ? 'Disabled' : 'Available'}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Occupied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCourt && currentStep !== 'EXPLORE' && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute md:sticky bottom-0 md:top-24 md:bottom-auto left-0 md:left-auto md:ml-auto right-0 md:mr-8 w-full md:w-[400px] max-w-full md:max-w-[calc(100vw-64px)] max-h-[80vh] md:max-h-none z-[260] pointer-events-auto overflow-y-auto custom-scrollbar rounded-t-3xl md:rounded-3xl"
          >
            <div className="glass p-6 md:p-8 border-white/5 shadow-2xl flex flex-col min-h-full">
              <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h3 className="text-white text-2xl font-bold tracking-tight">
                    Booking <span className="text-primary italic">3D</span>
                  </h3>
                  <div className="text-gray-400 text-[11px] font-medium mt-1.5 leading-relaxed opacity-80">
                    {currentStep === 'SELECT_COURT' && 'Vui lòng cung cấp thông tin để giữ sân.'}
                    {currentStep === 'CHOOSE_TIME' && 'Chọn khung giờ bạn muốn đặt trên timeline.'}
                    {currentStep === 'CONFIRM' && 'Kiểm tra thông tin cuối cùng trước khi xác nhận.'}
                  </div>
                </div>
                <button
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white hover:bg-red-500/10 hover:text-red-500 transition-all border-white/5"
                  onClick={() => {
                    selectCourt(null)
                    setSelectedSlot(null)
                    setStep('EXPLORE')
                  }}
                >✕</button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sân Đã Chọn</div>
                    <div className="text-white font-bold mt-1 text-sm">{selectedCourt.name}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Khung Giờ</div>
                    <div className="text-primary font-bold mt-1 text-sm">{selectedSlot?.time || '--:--'}</div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="label-standard">Họ và tên</label>
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (errors.fullName) setErrors((s) => ({ ...s, fullName: undefined }))
                      }}
                      className={`input-standard ${errors.fullName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      placeholder="Nhập tên của bạn"
                    />
                    {errors.fullName && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.fullName}</div>
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
                    <label className="label-standard">Thanh toán</label>
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
                          className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            paymentMethod === m.id
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="text-gray-500 text-[10px] mt-2 leading-relaxed">
                      {paymentMethod === 'CASH'
                        ? 'Thanh toán tại quầy khi đến sân.'
                        : paymentMethod === 'TRANSFER'
                          ? 'Chuyển khoản theo hướng dẫn sau khi đặt. Nhân viên sẽ xác nhận.'
                          : 'Quẹt thẻ tại quầy khi đến sân.'}
                    </div>
                    {paymentMethod !== 'CASH' && (
                      <button type="button" className="btn-secondary w-full !py-3 !text-[10px] mt-3" onClick={() => setPaymentOpen(true)}>
                        Nhập thông tin thanh toán
                      </button>
                    )}
                    {(paymentMethod === 'TRANSFER' && payErrors.transfer) && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.transfer}</div>
                    )}
                  </div>
                  {paymentOpen && paymentMethod !== 'CASH' && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center p-6">
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
                  <div>
                    <label className="label-standard">Ghi chú</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="input-standard min-h-[80px] resize-none"
                      placeholder="Yêu cầu thêm (không bắt buộc)"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex justify-between items-center mt-4">
                   <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Giá tạm tính</span>
                   <span className="text-white font-bold text-2xl tracking-tighter">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                  {currentStep !== 'CONFIRM' ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="btn-primary w-full"
                      onClick={() => setStep('CHOOSE_TIME')}
                    >
                      Tiếp Tục Chọn Giờ
                    </motion.button>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        className="btn-secondary col-span-1 !px-0"
                        onClick={() => {
                          setSelectedSlot(null)
                          setStep('CHOOSE_TIME')
                        }}
                      >
                        Lại
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary col-span-2 disabled:opacity-30 disabled:grayscale"
                        disabled={!selectedSlot || currentStep !== 'CONFIRM'}
                        onClick={async () => {
                          if (!selectedCourt || !selectedSlot) return
                          const next: { fullName?: string; phone?: string } = {}
                          const name = fullName.trim()
                          const phoneRaw = phone.trim()
                          const phoneNorm = normalizePhone(phoneRaw)
                          
                          if (!name) next.fullName = 'Vui lòng nhập họ tên'
                          else if (name.length < 2) next.fullName = 'Họ tên quá ngắn'
                          
                          if (!phoneNorm) next.phone = 'Vui lòng nhập số điện thoại'
                          else if (phoneNorm.length < 9 || phoneNorm.length > 11 || !phoneNorm.startsWith('0')) next.phone = 'Số điện thoại không hợp lệ (9-11 số, bắt đầu bằng 0)'
                          
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
                              date: selectedDate,
                              fullName: name,
                              phone: phoneNorm,
                              note: note.trim(),
                              totalPrice: selectedSlot.price,
                              paymentMethod,
                              userId: user?.id || null,
                            })
                            setDoneId(id)
                            setNotification({ message: `Đặt sân thành công • Mã ${id.slice(0, 8).toUpperCase()}`, type: 'success' })
                            setTimeout(() => {
                              selectCourt(null)
                              setSelectedSlot(null)
                              setStep('EXPLORE')
                              setTransferConfirmed(false)
                              setCard({ number: '', name: '', expiry: '', cvc: '' })
                              setPayErrors({})
                            }, 1500)
                          } catch (err: any) {
                            setNotification({ message: err.message || 'Lỗi đặt sân', type: 'error' })
                          }
                        }}
                      >
                        Xác nhận đặt
                      </motion.button>
                    </div>
                  )}
                  
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
