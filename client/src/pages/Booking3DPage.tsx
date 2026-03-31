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
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const setStep = useStore((s) => s.setStep)
  const selectCourt = useStore((s) => s.selectCourt)
  const setSelectedSlot = useStore((s) => s.setSelectedSlot)
  const createBooking = useStore((s) => s.createBooking)
  const updatePresence = useStore(s => s.updatePresence)
  const usersOnline = useStore(s => s.usersOnline)

  // Simulation of other users (Race Condition / Concurrency feel)
  useEffect(() => {
    const users = ['user-1', 'user-2', 'user-3']
    const interval = setInterval(() => {
      const u = users[Math.floor(Math.random() * users.length)]
      const pos: [number, number, number] = [(Math.random() - 0.5) * 60, 1.7, Math.random() * 140]
      updatePresence(u, Math.random() > 0.3 ? pos : null)
    }, 4000)
    return () => clearInterval(interval)
  }, [updatePresence])

  const selectedCourt = useMemo(() => courts.find((c) => c.id === selectedCourtId) || null, [courts, selectedCourtId])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH')
  const [zoneFilter, setZoneFilter] = useState<'BADMINTON' | 'PICKLEBALL' | 'TENNIS' | null>(null)
  const setNotification = useStore((s) => s.setNotification)

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

  return (
    <div className="relative w-full min-h-screen overflow-y-auto bg-[#020617]">
      <Scene />

      {/* View Mode Toggles */}
      <div className="absolute top-24 right-8 z-[250] flex flex-col gap-2">
        <button 
          onClick={() => setViewMode('OVERVIEW')}
          className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${viewMode === 'OVERVIEW' ? 'bg-primary border-primary text-surface shadow-lg shadow-primary-glow' : 'glass border-white/10 text-gray-400 hover:bg-white/5'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setViewMode('HUMAN')}
          className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${viewMode === 'HUMAN' ? 'bg-primary border-primary text-surface shadow-lg shadow-primary-glow' : 'glass border-white/10 text-gray-400 hover:bg-white/5'}`}
        >
          Walkthrough
        </button>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-8 left-8 z-[250] pointer-events-auto">
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
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
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

      <div className="absolute top-24 left-8 z-[250] pointer-events-auto flex items-center gap-3">
        <Link to="/booking" className="glass px-5 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-all border-white/5 flex items-center gap-2 text-xs tracking-wider uppercase">
          <span>←</span> 2D MODE
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary glass px-4 py-3 rounded-xl border-primary/20 bg-primary/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          3D Interactive {usersOnline > 1 && <span className="text-white/40 ml-1">({usersOnline} Live)</span>}
        </div>
      </div>

      <AnimatePresence>
        {selectedCourt && currentStep !== 'EXPLORE' && (
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="sticky top-24 self-start ml-auto mr-8 w-[400px] max-w-[calc(100vw-64px)] z-[260] pointer-events-auto overflow-y-auto custom-scrollbar"
          >
            <div className="glass rounded-3xl p-8 border-white/5 shadow-2xl flex flex-col min-h-full">
              <div className="flex items-start justify-between gap-4 mb-8">
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
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-standard"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="label-standard">Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-standard"
                      placeholder="Ví dụ: 090..."
                    />
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
                          onClick={() => setPaymentMethod(m.id as any)}
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
                  </div>
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
                        disabled={!selectedSlot || !phone.trim() || currentStep !== 'CONFIRM'}
                        onClick={async () => {
                          if (!selectedCourt || !selectedSlot) return
                          try {
                            const id = await createBooking({
                              courtId: selectedCourt.id,
                              courtName: selectedCourt.name,
                              slotId: selectedSlot.id,
                              slotTime: selectedSlot.time,
                              fullName: fullName.trim(),
                              phone: phone.trim(),
                              note: note.trim(),
                              totalPrice: selectedSlot.price,
                              paymentMethod,
                            })
                            setDoneId(id)
                            setTimeout(() => {
                              selectCourt(null)
                              setSelectedSlot(null)
                              setStep('EXPLORE')
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
                  
                  {doneId && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl py-4 text-center mt-2 animate-pulse-slow"
                    >
                      ✓ Đặt sân thành công
                    </motion.div>
                  )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
