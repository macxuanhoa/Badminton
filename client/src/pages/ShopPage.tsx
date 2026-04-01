import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, type OrderItem, type ProductRecord } from '../store/useStore'

type Product = ProductRecord

export function ShopPage() {
  const products = useStore((s) => s.products)
  const fetchProducts = useStore((s) => s.fetchProducts)
  const createOrder = useStore((s) => s.createOrder)
  const setNotification = useStore((s) => s.setNotification)

  useEffect(() => {
    fetchProducts()
  }, [])

  const [cart, setCart] = useState<Record<string, number>>({})
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
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; address?: string }>({})
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH')
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [payErrors, setPayErrors] = useState<{ transfer?: string; cardNumber?: string; cardName?: string; cardExpiry?: string; cardCvc?: string }>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('ALL')
  const [sort, setSort] = useState<'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC'>('RELEVANCE')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [visible, setVisible] = useState(12)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) set.add(p.category || 'Khác')
    return ['ALL', ...Array.from(set)]
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products

    if (category !== 'ALL') {
      list = list.filter((p) => (p.category || 'Khác') === category)
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stock || 0) > 0)
    }

    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name} ${(p.category || '')} ${(p.description || '')}`.toLowerCase()
        return hay.includes(q)
      })
    }

    if (sort === 'PRICE_ASC') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'PRICE_DESC') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'NAME_ASC') list = [...list].sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [products, query, category, inStockOnly, sort])

  const shownProducts = useMemo(() => filteredProducts.slice(0, visible), [filteredProducts, visible])

  const items = useMemo<OrderItem[]>(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const p = products.find((x) => x.id === productId)!
        return { productId, name: p.name, price: p.price, quantity }
      })
  }, [cart])

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items])
  const shippingFee = subtotal > 0 ? 30000 : 0
  const total = subtotal + shippingFee

  const [step, setCheckoutStep] = useState<'SELECT' | 'REVIEW' | 'CONFIRM'>('SELECT')
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

  const transferQrData = useMemo(() => {
    const amount = Math.round(total)
    const msg = encodeURIComponent(`ELYRA HUB | SHOP | ${amount} VND`)
    return `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${msg}`
  }, [total])

  const handleCheckout = async () => {
    try {
      const next: { fullName?: string; phone?: string; address?: string } = {}
      const name = fullName.trim()
      const phoneRaw = phone.trim()
      const phoneNorm = normalizePhone(phoneRaw)
      const addr = address.trim()
      if (!name) next.fullName = 'Vui lòng nhập họ tên'
      if (!phoneNorm) next.phone = 'Vui lòng nhập số điện thoại'
      else if (phoneNorm.length < 9 || phoneNorm.length > 11) next.phone = 'Số điện thoại không hợp lệ'
      if (!addr) next.address = 'Vui lòng nhập địa chỉ'
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

      const id = await createOrder({
        guestName: name || 'Khách',
        guestPhone: phoneNorm,
        items,
        total,
        paymentMethod,
      })
      setDoneId(id)
      setCart({})
      setFullName('')
      setPhone('')
      setAddress('')
      setNote('')
      setCheckoutStep('CONFIRM')
      setNotification({ message: `Đặt hàng thành công • Mã ${id.slice(0, 8).toUpperCase()}`, type: 'success' })
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi đặt hàng', type: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="space-y-2">
          <div className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Elyra Shop</div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Dụng Cụ <span className="text-primary italic">Chuyên Nghiệp</span></h1>
          <p className="text-gray-500 text-sm max-w-md">Trang bị tốt nhất để nâng tầm trận đấu của bạn. Giao hàng nhanh chóng trong 2h.</p>
        </div>
      </div>

      <div className="sticky top-[88px] z-[120] mb-10">
        <div className="glass rounded-3xl border-white/5 px-4 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2 md:gap-5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {['Sản phẩm', 'Thông tin', 'Hoàn tất'].map((s, i) => (
              <div key={i} className="flex items-center gap-1 md:gap-2 shrink-0">
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold ${
                  (i === 0 && step === 'SELECT') || (i === 1 && step === 'REVIEW') || (i === 2 && step === 'CONFIRM')
                    ? 'bg-primary text-surface'
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                  (i === 0 && step === 'SELECT') || (i === 1 && step === 'REVIEW') || (i === 2 && step === 'CONFIRM')
                    ? 'text-white'
                    : 'text-gray-600'
                }`}>{s}</span>
                {i < 2 && <div className="w-4 md:w-8 h-px bg-white/10 mx-1 md:mx-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 'SELECT' && (
        <div className="glass rounded-3xl border-white/5 p-5 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setVisible(12)
                  }}
                  placeholder="Tìm sản phẩm, thương hiệu, mô tả..."
                  className="input-standard !py-3 !text-sm pl-10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</div>
              </div>
            </div>
            <div className="md:col-span-3">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setVisible(12)
                }}
                className="input-standard !py-3 !text-sm appearance-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'Tất cả danh mục' : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="input-standard !py-3 !text-sm appearance-none"
              >
                <option value="RELEVANCE">Sắp xếp: Phù hợp</option>
                <option value="PRICE_ASC">Giá: Thấp → Cao</option>
                <option value="PRICE_DESC">Giá: Cao → Thấp</option>
                <option value="NAME_ASC">Tên: A → Z</option>
              </select>
            </div>
            <div className="md:col-span-1 flex md:justify-end">
              <button
                type="button"
                onClick={() => {
                  setInStockOnly((v) => !v)
                  setVisible(12)
                }}
                className={`px-3 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                  inStockOnly ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                }`}
                title="Chỉ hiển thị sản phẩm còn hàng"
              >
                Còn
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Hiển thị {shownProducts.length}/{filteredProducts.length} sản phẩm
            </div>
            {(query.trim() || category !== 'ALL' || inStockOnly || sort !== 'RELEVANCE') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setCategory('ALL')
                  setSort('RELEVANCE')
                  setInStockOnly(false)
                  setVisible(12)
                }}
                className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Main Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 'SELECT' ? (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-6"
              >
                {shownProducts.map((p) => (
                  <div key={p.id} className="glass-card group bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div 
                      className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-6xl cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {typeof p.image === 'string' && (p.image.startsWith('http') || p.image.startsWith('/')) ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="group-hover:scale-110 transition-transform duration-500">{p.image}</span>
                      )}
                      {p.tag && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-surface text-[10px] font-bold uppercase tracking-wider shadow-lg">
                          {p.tag}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-4">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{p.category}</div>
                        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedProduct(p)}>{p.name}</h3>
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-white font-black text-xl">{p.price.toLocaleString()}đ</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Còn lại: {p.stock}</div>
                        </div>

                        <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/5">
                          <button
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() =>
                              setCart((c) => ({ ...c, [p.id]: Math.max(0, (c[p.id] || 0) - 1) }))
                            }
                          >
                            −
                          </button>
                          <div className="w-8 text-center text-white font-bold text-sm">{cart[p.id] || 0}</div>
                          <button
                            className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-surface transition-all"
                            onClick={() => {
                              if ((cart[p.id] || 0) < p.stock) {
                                setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))
                              }
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="md:col-span-2 glass p-14 rounded-3xl border border-dashed border-white/10 text-center">
                    <div className="text-5xl opacity-20 mb-4">🛍️</div>
                    <div className="text-gray-500 font-bold uppercase tracking-widest text-sm">Không tìm thấy sản phẩm</div>
                    <div className="text-gray-600 text-xs mt-2">Thử đổi từ khóa hoặc bỏ bớt bộ lọc.</div>
                  </div>
                )}
                {filteredProducts.length > shownProducts.length && (
                  <div className="md:col-span-2 flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + 12)}
                      className="btn-secondary px-10 py-3.5 border-white/10 text-white"
                    >
                      Xem thêm sản phẩm
                    </button>
                  </div>
                )}
              </motion.div>
            ) : step === 'REVIEW' ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-6 md:p-10 rounded-3xl md:rounded-[40px] border-white/5 space-y-6 md:space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Thông tin <span className="text-primary italic">Đặt hàng</span></h2>
                  <button onClick={() => setCheckoutStep('SELECT')} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">← Quay lại shop</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="label-standard">Người nhận</label>
                      <input
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          if (errors.fullName) setErrors((s) => ({ ...s, fullName: undefined }))
                        }}
                        className={`input-standard ${errors.fullName ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      />
                      {errors.fullName && (
                        <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.fullName}</div>
                      )}
                    </div>
                    <div>
                      <label className="label-standard">Số điện thoại</label>
                      <input
                        placeholder="09xx xxx xxx"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }))
                        }}
                        className={`input-standard ${errors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      />
                      {errors.phone && (
                        <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.phone}</div>
                      )}
                    </div>
                    <div>
                      <label className="label-standard">Địa chỉ giao hàng</label>
                      <input
                        placeholder="Số nhà, tên đường, phường/xã..."
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value)
                          if (errors.address) setErrors((s) => ({ ...s, address: undefined }))
                        }}
                        className={`input-standard ${errors.address ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                      />
                      {errors.address && (
                        <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.address}</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="label-standard">Ghi chú thêm</label>
                      <textarea
                        placeholder="Thời gian nhận hàng, chỉ dẫn..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="input-standard min-h-[150px] resize-none"
                      />
                    </div>
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Ưu đãi thành viên</div>
                      <div className="text-white text-sm font-medium">Bạn sẽ nhận được <span className="text-primary font-bold">+{Math.floor(total / 1000)}</span> điểm tích lũy sau đơn hàng này.</div>
                    </div>
                  </div>
                </div>

                  <div className="pt-8 border-t border-white/5 space-y-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-white font-bold uppercase tracking-widest text-sm">Thanh toán</div>
                        <div className="text-muted text-[11px] font-medium mt-1">Chọn phương thức và hoàn tất thông tin.</div>
                      </div>
                    </div>

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

                    {paymentMethod === 'TRANSFER' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 glass rounded-3xl border-white/5 p-6">
                        <div className="md:col-span-5">
                          <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Quét mã để chuyển khoản</div>
                          <div className="mt-3 w-full aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                            <img src={transferQrData} alt="QR chuyển khoản" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="md:col-span-7 space-y-4">
                          <div className="text-white font-bold">Thông tin chuyển khoản</div>
                          <div className="grid grid-cols-1 gap-3 text-[11px]">
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                              <div className="text-muted font-bold uppercase tracking-widest text-[10px]">Nội dung</div>
                              <div className="text-white font-mono font-bold truncate">ELYRA HUB | SHOP</div>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                              <div className="text-muted font-bold uppercase tracking-widest text-[10px]">Số tiền</div>
                              <div className="text-white font-bold">{Math.round(total).toLocaleString()}đ</div>
                            </div>
                          </div>
                          <div className="pt-2">
                            <label className="inline-flex items-center gap-3 text-[11px] font-semibold text-white">
                              <input
                                type="checkbox"
                                checked={transferConfirmed}
                                onChange={(e) => {
                                  setTransferConfirmed(e.target.checked)
                                  if (payErrors.transfer) setPayErrors((s) => ({ ...s, transfer: undefined }))
                                }}
                                className="w-4 h-4 rounded border border-white/20 bg-white/5"
                              />
                              Tôi đã chuyển khoản và muốn tiếp tục
                            </label>
                            {payErrors.transfer && (
                              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.transfer}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div className="glass rounded-3xl border-white/5 p-6 space-y-5">
                        <div className="text-muted text-[10px] font-bold uppercase tracking-widest">Thanh toán bằng thẻ</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
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
                            {payErrors.cardNumber && (
                              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardNumber}</div>
                            )}
                          </div>
                          <div className="md:col-span-2">
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
                            {payErrors.cardName && (
                              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardName}</div>
                            )}
                          </div>
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
                            {payErrors.cardExpiry && (
                              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardExpiry}</div>
                            )}
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
                            {payErrors.cardCvc && (
                              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{payErrors.cardCvc}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 md:p-20 rounded-[32px] md:rounded-[40px] border-white/5 text-center space-y-4 md:space-y-6"
              >
                <div className="text-8xl animate-bounce-slow mb-8">📦</div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight">Đã nhận <span className="text-primary italic">Đơn hàng!</span></h2>
                <p className="text-gray-400 max-w-sm mx-auto">Mã đơn của bạn là <span className="text-white font-mono font-bold">#{doneId?.slice(0, 8).toUpperCase()}</span>. Chúng tôi sẽ liên hệ xác nhận trong ít phút.</p>
                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setCheckoutStep('SELECT')
                      setDoneId(null)
                    }}
                    className="btn-primary px-12 py-4"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          {step !== 'CONFIRM' && (
            <div className="glass rounded-3xl border-white/5 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                Đơn hàng
                {items.length > 0 && <span className="bg-primary text-surface text-[10px] px-2 py-0.5 rounded-full">{items.length}</span>}
              </h2>
              
              <div className="space-y-4 mb-8 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((it) => {
                  const p = products.find(x => x.id === it.productId)!
                  return (
                    <div key={it.productId} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/5">
                        {p.image}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-white font-bold text-sm truncate">{it.name}</div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold">
                          {it.quantity} × {it.price.toLocaleString()}đ
                        </div>
                      </div>
                      <div className="text-white font-bold text-sm">
                        {(it.quantity * it.price).toLocaleString()}đ
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <div className="text-4xl opacity-20 text-white">🛒</div>
                    <div className="text-gray-500 text-sm italic">Giỏ hàng đang trống</div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="text-white font-medium">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-white font-medium">{shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-lg pt-2">
                  <span className="text-white font-bold">Tổng cộng</span>
                  <span className="text-primary font-black">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="mt-8">
                {step === 'SELECT' ? (
                  <button
                    className="btn-primary w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={items.length === 0}
                    onClick={() => {
                      if (items.length === 0) {
                        setNotification({ message: 'Vui lòng chọn ít nhất 1 sản phẩm', type: 'error' })
                        return
                      }
                      setCheckoutStep('REVIEW')
                    }}
                  >
                    Tiếp tục đặt hàng →
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={items.length === 0}
                    onClick={handleCheckout}
                  >
                    Xác nhận thanh toán
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="glass rounded-3xl border-white/5 p-6 flex items-center gap-4 text-gray-500">
            <div className="text-2xl">🛡️</div>
            <div className="text-[10px] uppercase font-bold tracking-wider leading-relaxed">
              Thanh toán an toàn & bảo mật <br /> Hỗ trợ đổi trả trong 7 ngày
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="glass relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border-white/10 flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white z-10 hover:bg-white/10"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
            
            <div className="w-full md:w-1/2 aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-9xl relative overflow-hidden">
              {typeof selectedProduct.image === 'string' && (selectedProduct.image.startsWith('http') || selectedProduct.image.startsWith('/')) ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span>{selectedProduct.image}</span>
              )}
            </div>
            
            <div className="w-full md:w-1/2 p-10 flex flex-col">
              <div className="text-primary text-xs font-bold uppercase tracking-widest mb-2">{selectedProduct.category}</div>
              <h2 className="text-4xl font-black text-white uppercase leading-none mb-4">{selectedProduct.name}</h2>
              <div className="text-3xl font-black text-primary mb-6">{selectedProduct.price.toLocaleString()}đ</div>
              
              <div className="space-y-6 mb-8 flex-grow">
                <div>
                  <div className="label-standard">Mô tả sản phẩm</div>
                  <p className="text-gray-400 leading-relaxed">{selectedProduct.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-dark p-4 rounded-2xl border-white/5">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tình trạng</div>
                    <div className="text-white font-bold">{selectedProduct.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</div>
                  </div>
                  <div className="glass-dark p-4 rounded-2xl border-white/5">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Giao hàng</div>
                    <div className="text-white font-bold">24 - 48 Giờ</div>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn-primary w-full !py-5"
                onClick={() => {
                  setCart(c => ({ ...c, [selectedProduct.id]: (c[selectedProduct.id] || 0) + 1 }))
                  setSelectedProduct(null)
                }}
              >
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
