import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

function TimeRemaining({ slotTime, checkInAt }: { slotTime?: string, checkInAt: number }) {
  const [remaining, setRemaining] = useState<string>('--:--')
  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'OVERTIME'>('WAITING')

  useEffect(() => {
    if (!slotTime) {
      setRemaining('N/A')
      return
    }

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
        const secs = Math.floor((diff % 60000) / 1000)
        setRemaining(`Chờ ${mins}:${secs.toString().padStart(2, '0')}`)
      } else if (currentTime < endTime) {
        setStatus('PLAYING')
        const diff = endTime - currentTime
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
      } else {
        setStatus('OVERTIME')
        const diff = currentTime - endTime
        const mins = Math.floor(diff / 60000)
        setRemaining(`Quá ${mins}m`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [slotTime])

  const colors = {
    WAITING: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    PLAYING: 'text-primary bg-primary/10 border-primary/20',
    OVERTIME: 'text-red-500 bg-red-500/10 border-red-500/20'
  }

  return (
    <div className={`px-3 py-1 rounded-lg border text-[10px] font-bold font-mono inline-block ${colors[status]}`}>
      {remaining}
    </div>
  )
}

export function AdminPage() {
  const bookings = useStore((s) => s.bookings)
  const orders = useStore((s) => s.orders)
  const checkIns = useStore((s) => s.checkIns)
  const lockers = useStore((s) => s.lockers)
  const products = useStore((s) => s.products)
  const user = useStore((s) => s.user)
  const fetchBookings = useStore((s) => s.fetchBookings)
  const fetchOrders = useStore((s) => s.fetchOrders)
  const createCheckIn = useStore((s) => s.createCheckIn)
  const updateCheckInStatus = useStore((s) => s.updateCheckInStatus)
  const updateBookingStatus = useStore((s) => s.updateBookingStatus)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)

  const [userCount, setUserCount] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'BOOKINGS' | 'ORDERS' | 'PRODUCTS'>('OPERATIONS')
  const [newCheckIn, setNewCheckIn] = useState({ fullName: '', phone: '', lockerNumber: '', courtId: '', slotTime: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [showManualBooking, setShowManualBooking] = useState(false)
  const [checkInErrors, setCheckInErrors] = useState<{ fullName?: string; phone?: string }>({})
  const [manualBooking, setManualBooking] = useState({
    courtId: '',
    slotId: '',
    slotTime: '',
    fullName: '',
    phone: '',
    totalPrice: 0,
  })
  const [manualBookingErrors, setManualBookingErrors] = useState<{ courtId?: string; slotId?: string; fullName?: string; phone?: string }>({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Vợt Cầu Lông',
    price: 0,
    stock: 0,
    description: '',
    tag: '',
    image: '🏸'
  })
  const [productErrors, setProductErrors] = useState<{ name?: string; category?: string; price?: string; stock?: string; image?: string }>({})

  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const setNotification = useStore((s) => s.setNotification)

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const next: { name?: string; category?: string; price?: string; stock?: string; image?: string } = {}
      if (!productForm.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm'
      if (!productForm.category.trim()) next.category = 'Vui lòng chọn phân loại'
      if (!Number.isFinite(productForm.price) || productForm.price <= 0) next.price = 'Giá phải lớn hơn 0'
      if (!Number.isFinite(productForm.stock) || productForm.stock < 0) next.stock = 'Tồn kho không hợp lệ'
      if (!String(productForm.image || '').trim()) next.image = 'Vui lòng nhập emoji hoặc URL ảnh'
      setProductErrors(next)
      if (Object.keys(next).length > 0) return
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm)
        setNotification({ message: 'Cập nhật sản phẩm thành công!', type: 'success' })
      } else {
        await addProduct(productForm)
        setNotification({ message: 'Thêm sản phẩm thành công!', type: 'success' })
      }
      setShowProductModal(false)
      setEditingProduct(null)
      setProductForm({ name: '', category: 'Vợt Cầu Lông', price: 0, stock: 0, description: '', tag: '', image: '🏸' })
      setProductErrors({})
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi xử lý sản phẩm', type: 'error' })
    }
  }

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product)
      setProductErrors({})
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        tag: product.tag || '',
        image: product.image || '🏸'
      })
    } else {
      setEditingProduct(null)
      setProductErrors({})
      setProductForm({ name: '', category: 'Vợt Cầu Lông', price: 0, stock: 0, description: '', tag: '', image: '🏸' })
    }
    setShowProductModal(true)
  }

  const courts = useStore((s) => s.courts)
  const updateCourtStatus = useStore((s) => s.updateCourtStatus)
  const createBooking = useStore((s) => s.createBooking)

  const releaseBooking = useStore((s) => s.releaseBooking)
  const extendBooking = useStore((s) => s.extendBooking)

  const createOrder = useStore((s) => s.createOrder)

  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '')

  const handleManualOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock logic for staff creating order at counter
    // In real app, you'd have a cart UI in admin too
    setNotification({ message: 'Tính năng bán hàng tại quầy đang được cập nhật!', type: 'success' })
  }

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: { courtId?: string; slotId?: string; fullName?: string; phone?: string } = {}
    const phoneRaw = manualBooking.phone.trim()
    const phone = normalizePhone(phoneRaw)
    if (!manualBooking.courtId) next.courtId = 'Vui lòng chọn sân'
    if (!manualBooking.slotId) next.slotId = 'Vui lòng chọn giờ'
    if (!manualBooking.fullName.trim()) next.fullName = 'Vui lòng nhập tên khách'
    if (!phone) next.phone = 'Vui lòng nhập số điện thoại'
    else if (phone.length < 9 || phone.length > 11) next.phone = 'Số điện thoại không hợp lệ'
    setManualBookingErrors(next)
    if (Object.keys(next).length > 0) return
    
    const court = courts.find(c => c.id === manualBooking.courtId)
    if (!court) return

    try {
      await createBooking({
        courtId: manualBooking.courtId,
        courtName: court.name,
        slotId: manualBooking.slotId,
        slotTime: manualBooking.slotTime,
        fullName: manualBooking.fullName,
        phone,
        note: 'Staff Manual Booking',
        totalPrice: manualBooking.totalPrice,
        paymentMethod: 'CASH',
        isManual: true
      })
      setShowManualBooking(false)
      setManualBooking({ courtId: '', slotId: '', slotTime: '', fullName: '', phone: '', totalPrice: 0 })
      setManualBookingErrors({})
      setNotification({ message: 'Đặt sân thủ công thành công', type: 'success' })
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi đặt sân thủ công', type: 'error' })
    }
  }

  const slots = [
    { id: '1', time: '05:00 - 06:00', price: 100000 },
    { id: '2', time: '06:00 - 07:00', price: 120000 },
    { id: '3', time: '17:00 - 18:00', price: 180000 },
    { id: '4', time: '18:00 - 19:00', price: 220000 },
    { id: '5', time: '19:00 - 20:00', price: 220000 },
  ]

  const handlePhoneChange = (phone: string) => {
    setNewCheckIn(prev => ({ ...prev, phone }))
    
    // Auto-link to booking
    const booking = bookings.find(b => b.phone === phone && b.status === 'CONFIRMED')
    if (booking) {
      setNewCheckIn(prev => ({ 
        ...prev, 
        fullName: booking.fullName, 
        courtId: booking.courtId,
        slotTime: booking.slotTime 
      }))
      setNotification({ message: 'Tìm thấy booking phù hợp!', type: 'success' })
    }
  }

  const handleAutoLocker = () => {
    const availableLocker = lockers.find(l => l.status === 'AVAILABLE')
    if (availableLocker) {
      setNewCheckIn(prev => ({ ...prev, lockerNumber: availableLocker.number }))
    }
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: { fullName?: string; phone?: string } = {}
    const name = newCheckIn.fullName.trim()
    const phoneRaw = newCheckIn.phone.trim()
    const phone = normalizePhone(phoneRaw)
    if (!name) next.fullName = 'Vui lòng nhập họ tên'
    if (!phone) next.phone = 'Vui lòng nhập số điện thoại'
    else if (phone.length < 9 || phone.length > 11) next.phone = 'Số điện thoại không hợp lệ'
    setCheckInErrors(next)
    if (Object.keys(next).length > 0) return
    
    // Prevent duplicate active check-ins
    const alreadyActive = checkIns.some(c => c.phone === phone && c.status === 'ACTIVE')
    if (alreadyActive) {
      setNotification({ message: 'Khách hàng này hiện đang có mặt tại Hub.', type: 'error' })
      return
    }

    try {
      await createCheckIn({
        userId: `user-${Date.now()}`,
        fullName: name,
        phone,
        lockerNumber: newCheckIn.lockerNumber || undefined,
        courtId: newCheckIn.courtId || undefined,
        slotTime: newCheckIn.slotTime || undefined
      })
      setNewCheckIn({ fullName: '', phone: '', lockerNumber: '', courtId: '', slotTime: '' })
      setCheckInErrors({})
      setNotification({ message: 'Check-in thành công!', type: 'success' })
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi check-in', type: 'error' })
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      await updateCheckInStatus(id, 'COMPLETED')
      setNotification({ message: 'Check-out thành công!', type: 'success' })
    } catch (err: any) {
      setNotification({ message: 'Lỗi check-out', type: 'error' })
    }
  }

  const filteredCheckIns = checkIns.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  )

  useEffect(() => {
    if (!user) return
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      fetchBookings()
      fetchOrders()
    }
  }, [user, fetchBookings, fetchOrders])

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      setUserCount(null)
      return
    }
    let mounted = true
    ;(async () => {
      const res = await api.get('/users').catch(() => null)
      if (!mounted) return
      setUserCount(Array.isArray(res?.data) ? res?.data.length : null)
    })()
    return () => {
      mounted = false
    }
  }, [user?.role])

  const stats = useMemo(() => {
    const bookingRevenue = bookings.filter((b) => b.status !== 'CANCELLED').reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)
    const orderRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + Number(o.total || 0), 0)
    const activeCheckIns = checkIns.filter((c) => c.status === 'ACTIVE').length
    return {
      bookingCount: bookings.length,
      orderCount: orders.length,
      bookingRevenue,
      orderRevenue,
      activeCheckIns,
    }
  }, [bookings, orders, checkIns])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-6 py-6 flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 flex-shrink-0">
        <div>
          <h1 className="text-white font-bold text-3xl tracking-tight uppercase leading-none">ELYRA HUB <span className="text-primary italic">OPERATIONS</span></h1>
          <p className="text-gray-500 text-[10px] mt-1.5 font-bold uppercase tracking-widest opacity-80">Trung tâm điều phối vận hành thời gian thực.</p>
        </div>
        <div className="flex glass p-1 rounded-2xl border border-white/5 self-start shadow-xl">
          {(['OPERATIONS', 'BOOKINGS', 'ORDERS', 'PRODUCTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                activeTab === tab ? 'bg-primary text-surface shadow-lg shadow-primary-glow' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'OPERATIONS' ? 'Vận hành' : tab === 'BOOKINGS' ? 'Sân bãi' : tab === 'ORDERS' ? 'Dịch vụ' : 'Kho hàng'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass rounded-2xl border border-white/5 p-5">
          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Booking</div>
          <div className="text-white text-2xl font-black tracking-tight mt-1">{stats.bookingCount}</div>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-5">
          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Đơn hàng</div>
          <div className="text-white text-2xl font-black tracking-tight mt-1">{stats.orderCount}</div>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-5">
          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Doanh thu sân</div>
          <div className="text-white text-2xl font-black tracking-tight mt-1">{Math.round(stats.bookingRevenue).toLocaleString()}đ</div>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-5">
          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Doanh thu store</div>
          <div className="text-white text-2xl font-black tracking-tight mt-1">{Math.round(stats.orderRevenue).toLocaleString()}đ</div>
        </div>
        <div className="glass rounded-2xl border border-white/5 p-5">
          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Người dùng</div>
          <div className="text-white text-2xl font-black tracking-tight mt-1">{userCount ?? '-'}</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OPERATIONS' && (
          <motion.div 
            key="ops"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0"
          >
            {/* Quick Action Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-5 bg-primary rounded-full"></span>
                  Check-in Khách
                </h2>
                <form onSubmit={handleCheckIn} className="space-y-5">
                  <div>
                    <label className="label-standard text-[9px]">Số Điện Thoại</label>
                    <input
                      type="text"
                      value={newCheckIn.phone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value)
                        if (checkInErrors.phone) setCheckInErrors((s) => ({ ...s, phone: undefined }))
                      }}
                      className={`input-standard !py-3 !px-4 !text-sm ${checkInErrors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      placeholder="Nhập SĐT khách hàng"
                    />
                    {checkInErrors.phone && (
                      <div className="mt-2 text-red-400 text-[9px] font-bold uppercase tracking-widest">{checkInErrors.phone}</div>
                    )}
                  </div>
                  <div>
                    <label className="label-standard text-[9px]">Họ Tên</label>
                    <input
                      type="text"
                      value={newCheckIn.fullName}
                      onChange={(e) => {
                        setNewCheckIn({ ...newCheckIn, fullName: e.target.value })
                        if (checkInErrors.fullName) setCheckInErrors((s) => ({ ...s, fullName: undefined }))
                      }}
                      className={`input-standard !py-3 !px-4 !text-sm ${checkInErrors.fullName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      placeholder="Hệ thống tự điền..."
                    />
                    {checkInErrors.fullName && (
                      <div className="mt-2 text-red-400 text-[9px] font-bold uppercase tracking-widest">{checkInErrors.fullName}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-standard text-[9px]">Sân</label>
                      <input
                        type="text"
                        readOnly
                        value={newCheckIn.courtId || 'Chưa có'}
                        className="input-standard bg-white/5 text-gray-400 !py-3 !px-4 !text-sm"
                      />
                    </div>
                    <div>
                      <label className="label-standard text-[9px]">Giờ</label>
                      <input
                        type="text"
                        readOnly
                        value={newCheckIn.slotTime || 'Chưa có'}
                        className="input-standard bg-white/5 text-gray-400 !py-3 !px-4 !text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="label-standard !mb-0 text-[9px]">Tủ Đồ (Locker)</label>
                      <button 
                        type="button" 
                        onClick={handleAutoLocker}
                        className="text-[8px] font-bold text-primary uppercase tracking-widest hover:underline"
                      >
                        Gán Tự Động
                      </button>
                    </div>
                    <select
                      value={newCheckIn.lockerNumber}
                      onChange={(e) => setNewCheckIn({ ...newCheckIn, lockerNumber: e.target.value })}
                      className="input-standard appearance-none bg-black/40 !py-3 !px-4 !text-sm"
                    >
                      <option value="">Không sử dụng</option>
                      {lockers.filter(l => l.status === 'AVAILABLE').map(l => (
                        <option key={l.id} value={l.number}>Tủ {l.number}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="btn-primary w-full py-3.5 mt-2 shadow-xl text-xs"
                  >
                    XÁC NHẬN VÀO HUB
                  </motion.button>
                </form>
              </div>

              <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-5 bg-primary rounded-full"></span>
                  Bản Đồ Tủ Đồ
                </h2>
                <div className="grid grid-cols-5 gap-2.5">
                  {lockers.map(l => (
                    <motion.div
                      key={l.id}
                      initial={false}
                      animate={{ 
                        backgroundColor: l.status === 'OCCUPIED' ? 'rgba(34, 197, 148, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: l.status === 'OCCUPIED' ? 'rgba(34, 197, 148, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all cursor-default ${
                        l.status === 'OCCUPIED' ? 'text-primary shadow-lg shadow-primary-glow/20' : 'text-gray-600'
                      }`}
                    >
                      {l.number}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Smart Inventory Section */}
              <div className="glass p-6 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-5 bg-yellow-500 rounded-full"></span>
                  Quản Lý Kho
                </h2>
                <div className="space-y-3">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{p.image}</div>
                        <div>
                          <div className="text-white text-[11px] font-bold leading-tight">{p.name}</div>
                          <div className={`text-[8px] font-bold uppercase mt-1 ${p.stock <= (p.minStock || 5) ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                            Kho: {p.stock} {p.stock <= (p.minStock || 5) && '(Sắp hết!)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-primary font-bold text-[11px]">{p.price.toLocaleString()}đ</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* VIP Presence Banner */}
              {user && (
                <div className="glass p-6 rounded-3xl border border-primary/20 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent shadow-xl flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-surface font-black text-xl shadow-lg shadow-primary-glow">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg flex items-center gap-3 tracking-tight">
                        {user.name} 
                        <span className="text-[9px] bg-yellow-500 text-surface px-2 py-0.5 rounded-lg font-bold uppercase tracking-widest">
                          {user.membership} VIP
                        </span>
                      </div>
                      <div className="text-gray-400 text-[11px] font-medium mt-0.5 opacity-80">Wallet: <span className="text-primary">{user.walletBalance.toLocaleString()}đ</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Skill Level</div>
                    <div className="text-white font-bold text-base uppercase tracking-tight">{user.skillLevel}</div>
                  </div>
                </div>
              )}

              <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <h2 className="text-white font-bold text-xl tracking-tight uppercase">KHÁCH TẠI HUB</h2>
                  <div className="relative flex-1 max-w-sm">
                    <input 
                      type="text"
                      placeholder="Tìm khách hàng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-10 py-2.5 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-gray-600"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 opacity-60 italic text-[10px]">Search</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] text-left border-b border-white/5">
                        <th className="pb-4 pl-2">Khách Hàng</th>
                        <th className="pb-4">Vị trí</th>
                        <th className="pb-4">Thời gian chơi</th>
                        <th className="pb-4">Tủ Đồ</th>
                        <th className="pb-4 text-right pr-2">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCheckIns.filter(c => c.status === 'ACTIVE').map((c, idx) => (
                        <motion.tr 
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 pl-2">
                            <div className="text-white font-bold text-sm tracking-tight">{c.fullName}</div>
                            <div className="text-primary text-[10px] font-medium opacity-80">{c.phone}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-white text-xs font-bold uppercase tracking-tight">{c.courtId || 'N/A'}</div>
                            <div className="text-gray-500 text-[9px] font-bold mt-0.5 uppercase">{c.slotTime || 'Chưa rõ'}</div>
                          </td>
                          <td className="py-4">
                            <TimeRemaining slotTime={c.slotTime} checkInAt={c.checkInAt} />
                          </td>
                          <td className="py-4">
                            {c.lockerNumber ? (
                              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                                TỦ {c.lockerNumber}
                              </span>
                            ) : (
                              <span className="text-gray-700 text-xs font-bold">—</span>
                            )}
                          </td>
                          <td className="py-4 text-right pr-2">
                            <div className="flex justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCheckOut(c.id)}
                                className="px-3.5 py-1.5 rounded-xl border border-primary/30 text-primary text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-surface transition-all"
                              >
                                Checkout
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCheckIns.filter(c => c.status === 'ACTIVE').length === 0 && (
                    <div className="py-20 text-center">
                      <div className="text-4xl mb-4 opacity-20">🏟️</div>
                      <div className="text-gray-600 font-bold uppercase tracking-widest text-[10px] italic">Hiện không có khách tại Hub</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'BOOKINGS' && (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowManualBooking(true)}
                  className="btn-primary !py-2.5 !px-5"
                >
                  + Đặt Sân Thủ Công
                </button>
                <div className="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-3">
                   <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Trạng thái sân:</span>
                   <select 
                     onChange={(e) => {
                       const [id, status] = e.target.value.split(':');
                       if (id) updateCourtStatus(id, status as any);
                     }}
                     className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                   >
                     <option value="">-- Cập nhật trạng thái --</option>
                     {courts.map(c => (
                       <optgroup key={c.id} label={c.name}>
                         <option value={`${c.id}:AVAILABLE`}>✅ Sẵn sàng</option>
                         <option value={`${c.id}:MAINTENANCE`}>🛠️ Bảo trì</option>
                       </optgroup>
                     ))}
                   </select>
                </div>
              </div>
              <div className="flex gap-8">
                 <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary-glow/40"></span> Hoàn tất
                 </div>
                 <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span> Đã hủy
                 </div>
              </div>
            </div>

            <div className="glass p-10 rounded-3xl border border-white/5 shadow-2xl">
              <h2 className="text-white font-bold text-2xl tracking-tight uppercase mb-8">LỊCH ĐẶT SÂN</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] text-left border-b border-white/5">
                    <th className="pb-6 pl-2">Loại Sân</th>
                    <th className="pb-6">Khách Hàng</th>
                    <th className="pb-6">Thời Gian</th>
                    <th className="pb-6 text-right">Thanh Toán</th>
                    <th className="pb-6 text-right pr-2">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((b, idx) => (
                    <motion.tr 
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="py-6 pl-2">
                        <span className="text-white font-bold text-lg tracking-tight">{b.courtName}</span>
                      </td>
                      <td className="py-6">
                        <div className="text-white font-bold text-base tracking-tight">{b.fullName}</div>
                        <div className="text-primary text-xs font-medium opacity-80">{b.phone}</div>
                      </td>
                      <td className="py-6 text-gray-400 font-mono text-sm opacity-80">{b.slotTime}</td>
                      <td className="py-6 text-right font-bold text-white text-lg tracking-tight">{b.totalPrice.toLocaleString()}đ</td>
                      <td className="py-6 text-right pr-2">
                        {b.status !== 'CANCELLED' && (
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={async () => {
                                const nextSlotId = (parseInt(b.slotId) + 1).toString();
                                const nextSlot = slots.find(s => s.id === nextSlotId);
                                if (nextSlot) {
                                  try {
                                    await extendBooking(b.id, nextSlot.id, nextSlot.time, nextSlot.price);
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                } else {
                                  alert('Không còn khung giờ tiếp theo để gia hạn.');
                                }
                              }}
                              className="text-primary hover:text-primary-hover text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Gia Hạn
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await releaseBooking(b.id);
                                } catch (err: any) {
                                  alert(err.message);
                                }
                              }}
                              className="text-red-500/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Giải Phóng
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

        {activeTab === 'ORDERS' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass p-10 rounded-3xl border border-white/5 shadow-2xl"
          >
            <h2 className="text-white font-bold text-2xl mb-12 tracking-tight uppercase">DỊCH VỤ CAFE & STORE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {orders.map((o) => (
                <motion.div 
                  key={o.id}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl"
                >
                  <div className={`absolute top-0 right-0 px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl ${
                    o.status === 'DELIVERED' ? 'bg-primary text-surface shadow-lg shadow-primary-glow/40' : 'bg-primary/20 text-primary border-l border-b border-primary/20'
                  }`}>
                    {o.status === 'DELIVERED' ? 'Đã Giao' : 'Đang Xử Lý'}
                  </div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-white font-bold text-xl tracking-tight">{o.guestName || (o.userId ? 'Member' : 'Khách')}</div>
                      <div className="text-primary text-xs font-bold mt-1 opacity-80">{o.guestPhone || '-'}</div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8 border-y border-white/5 py-6">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">
                          <span className="text-primary font-bold mr-2">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="text-white font-bold">{((item.price || 0) * item.quantity).toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-white tracking-tight">{o.total.toLocaleString()}đ</div>
                    {o.status !== 'DELIVERED' && (
                      <button
                        onClick={() => updateOrderStatus(o.id, 'DELIVERED')}
                        className="btn-primary !px-4 !py-2.5 !text-[10px]"
                      >
                        Hoàn Tất
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'PRODUCTS' && (
          <motion.div 
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-2xl tracking-tight uppercase">Quản lý kho hàng</h2>
              <button 
                onClick={() => openProductModal()}
                className="btn-primary !py-2.5 !px-5"
              >
                + Thêm sản phẩm
              </button>
            </div>

            <div className="glass p-10 rounded-3xl border border-white/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] text-left border-b border-white/5">
                      <th className="pb-6 pl-2">Sản phẩm</th>
                      <th className="pb-6">Phân loại</th>
                      <th className="pb-6 text-right">Giá bán</th>
                      <th className="pb-6 text-center">Tồn kho</th>
                      <th className="pb-6 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p, idx) => (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-white/[0.01] transition-colors"
                      >
                        <td className="py-6 pl-2">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl border border-white/5">
                              {p.image}
                            </div>
                            <div>
                              <div className="text-white font-bold text-base tracking-tight">{p.name}</div>
                              <div className="text-gray-500 text-xs truncate max-w-[200px]">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">{p.category}</span>
                        </td>
                        <td className="py-6 text-right text-white font-bold">
                          {p.price.toLocaleString()}đ
                        </td>
                        <td className="py-6 text-center">
                          <span className={`text-sm font-bold ${p.stock <= (p.minStock || 5) ? 'text-red-500' : 'text-white'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-6 text-right pr-2">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => openProductModal(p)}
                              className="text-primary hover:text-primary-hover text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                  deleteProduct(p.id)
                                }
                              }}
                              className="text-red-500/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {showManualBooking && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowManualBooking(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-dark w-full max-w-xl rounded-[32px] border border-white/10 p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-white font-bold text-2xl tracking-tight uppercase">Đặt Sân Thủ Công <span className="text-primary italic">(Staff)</span></h2>
                 <button onClick={() => setShowManualBooking(false)} className="text-gray-500 hover:text-white transition-all text-xl">✕</button>
              </div>

              <form onSubmit={handleManualBooking} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="label-standard">Chọn Sân</label>
                       <select 
                         value={manualBooking.courtId}
                         onChange={(e) => {
                           setManualBooking({ ...manualBooking, courtId: e.target.value })
                           if (manualBookingErrors.courtId) setManualBookingErrors((s) => ({ ...s, courtId: undefined }))
                         }}
                         className={`input-standard appearance-none ${manualBookingErrors.courtId ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                       >
                         <option value="">-- Chọn sân --</option>
                         {courts.map(c => (
                           <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                         ))}
                       </select>
                       {manualBookingErrors.courtId && (
                         <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{manualBookingErrors.courtId}</div>
                       )}
                    </div>
                    <div>
                       <label className="label-standard">Chọn Khung Giờ</label>
                       <select 
                         value={manualBooking.slotId}
                         onChange={(e) => {
                           const slot = slots.find(s => s.id === e.target.value);
                           if (slot) setManualBooking({...manualBooking, slotId: slot.id, slotTime: slot.time, totalPrice: slot.price});
                           if (manualBookingErrors.slotId) setManualBookingErrors((s) => ({ ...s, slotId: undefined }))
                         }}
                         className={`input-standard appearance-none ${manualBookingErrors.slotId ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                       >
                         <option value="">-- Chọn giờ --</option>
                         {slots.map(s => (
                           <option key={s.id} value={s.id}>{s.time}</option>
                         ))}
                       </select>
                       {manualBookingErrors.slotId && (
                         <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{manualBookingErrors.slotId}</div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="label-standard">Khách Hàng</label>
                       <input 
                         value={manualBooking.fullName}
                         onChange={(e) => {
                           setManualBooking({ ...manualBooking, fullName: e.target.value })
                           if (manualBookingErrors.fullName) setManualBookingErrors((s) => ({ ...s, fullName: undefined }))
                         }}
                         className={`input-standard ${manualBookingErrors.fullName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                         placeholder="Nhập tên khách" 
                       />
                       {manualBookingErrors.fullName && (
                         <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{manualBookingErrors.fullName}</div>
                       )}
                    </div>
                    <div>
                       <label className="label-standard">Số Điện Thoại</label>
                       <input 
                         value={manualBooking.phone}
                         onChange={(e) => {
                           setManualBooking({ ...manualBooking, phone: e.target.value })
                           if (manualBookingErrors.phone) setManualBookingErrors((s) => ({ ...s, phone: undefined }))
                         }}
                         className={`input-standard ${manualBookingErrors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                         placeholder="Nhập SĐT để quản lý" 
                       />
                       {manualBookingErrors.phone && (
                         <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{manualBookingErrors.phone}</div>
                       )}
                    </div>
                 </div>

                 <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex justify-between items-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Thành Tiền (Thu tiền mặt)</span>
                    <span className="text-white font-bold text-2xl tracking-tight">{manualBooking.totalPrice.toLocaleString()}đ</span>
                 </div>

                 <button type="submit" className="btn-primary w-full py-4 shadow-xl shadow-primary-glow/20">Xác nhận và đặt sân</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-dark w-full max-w-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-white font-bold text-2xl tracking-tight uppercase">
                   {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                 </h2>
                 <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-white transition-all text-xl">✕</button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="label-standard">Tên sản phẩm</label>
                    <input 
                      value={productForm.name}
                      onChange={(e) => {
                        setProductForm({ ...productForm, name: e.target.value })
                        if (productErrors.name) setProductErrors((s) => ({ ...s, name: undefined }))
                      }}
                      className={`input-standard ${productErrors.name ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                      placeholder="Ví dụ: Vợt Yonex Astrox..." 
                    />
                    {productErrors.name && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{productErrors.name}</div>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="label-standard">Phân loại</label>
                    <select 
                      value={productForm.category}
                      onChange={(e) => {
                        setProductForm({ ...productForm, category: e.target.value })
                        if (productErrors.category) setProductErrors((s) => ({ ...s, category: undefined }))
                      }}
                      className={`input-standard appearance-none ${productErrors.category ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                    >
                      <option value="Vợt Cầu Lông">Vợt Cầu Lông</option>
                      <option value="Quả Cầu Lông">Quả Cầu Lông</option>
                      <option value="Giày Cầu Lông">Giày Cầu Lông</option>
                      <option value="Phụ Kiện">Phụ Kiện</option>
                      <option value="Nước uống">Nước uống</option>
                    </select>
                    {productErrors.category && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{productErrors.category}</div>
                    )}
                  </div>
                  <div>
                    <label className="label-standard">Giá bán (VNĐ)</label>
                    <input 
                      type="number"
                      value={productForm.price}
                      onChange={(e) => {
                        setProductForm({ ...productForm, price: parseInt(e.target.value) })
                        if (productErrors.price) setProductErrors((s) => ({ ...s, price: undefined }))
                      }}
                      className={`input-standard ${productErrors.price ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                    />
                    {productErrors.price && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{productErrors.price}</div>
                    )}
                  </div>
                  <div>
                    <label className="label-standard">Số lượng tồn kho</label>
                    <input 
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => {
                        setProductForm({ ...productForm, stock: parseInt(e.target.value) })
                        if (productErrors.stock) setProductErrors((s) => ({ ...s, stock: undefined }))
                      }}
                      className={`input-standard ${productErrors.stock ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                    />
                    {productErrors.stock && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{productErrors.stock}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="label-standard">Mô tả ngắn</label>
                    <textarea 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="input-standard min-h-[100px] resize-none" 
                      placeholder="Thông tin chi tiết sản phẩm..."
                    />
                  </div>
                  <div>
                    <label className="label-standard">Nhãn (Tag)</label>
                    <select 
                      value={productForm.tag}
                      onChange={(e) => setProductForm({...productForm, tag: e.target.value})}
                      className="input-standard appearance-none"
                    >
                      <option value="">Không có</option>
                      <option value="HOT">HOT</option>
                      <option value="NEW">NEW</option>
                      <option value="BEST_SELLER">BEST SELLER</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-standard">Biểu tượng (Emoji)</label>
                    <input 
                      value={productForm.image}
                      onChange={(e) => {
                        setProductForm({ ...productForm, image: e.target.value })
                        if (productErrors.image) setProductErrors((s) => ({ ...s, image: undefined }))
                      }}
                      className={`input-standard text-center text-2xl ${productErrors.image ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`} 
                    />
                    {productErrors.image && (
                      <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{productErrors.image}</div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 shadow-xl shadow-primary-glow/20"
                  >
                    {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
