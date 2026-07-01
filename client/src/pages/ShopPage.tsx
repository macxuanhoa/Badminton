import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, type OrderItem, type ProductRecord } from '../store/useStore'

type Product = ProductRecord

export function ShopPage() {
  const products = useStore((s) => s.products)
  const fetchProducts = useStore((s) => s.fetchProducts)
  const createOrder = useStore((s) => s.createOrder)
  const setNotification = useStore((s) => s.setNotification)
  const cart = useStore((s) => s.cart)
  const setCart = useStore((s) => s.setCart)
  const clearCart = useStore((s) => s.clearCart)
  const user = useStore((s) => s.user)
  const [fullName, setFullName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'logged-in'>(user ? 'logged-in' : 'guest')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setPhone(user.phone || '')
      setCheckoutMode('logged-in')
    } else {
      setCheckoutMode('guest')
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
  }, [cart, products])

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
      else if (!phoneNorm.startsWith('0')) next.phone = 'Số điện thoại phải bắt đầu bằng 0'
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

      // Calculate total from products to ensure we don't trust cart total alone
      const calculatedTotal = items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId)
        if (!product) return sum
        return sum + product.price * item.quantity
      }, 0) + shippingFee

      const id = await createOrder({
        guestName: checkoutMode === 'guest' ? name : undefined,
        guestPhone: checkoutMode === 'guest' ? phoneNorm : undefined,
        guestAddress: checkoutMode === 'guest' ? addr : undefined,
        items,
        total: calculatedTotal,
        paymentMethod,
      })
      setDoneId(id)
      clearCart()
      setFullName('')
      setPhone('')
      setAddress('')
      setNote('')
      setCheckoutStep('CONFIRM')
      setNotification({ message: `Đặt hàng thành công • Mã ${id.slice(0, 8).toUpperCase()}`, type: 'success' })
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || err.message || 'Lỗi đặt hàng', type: 'error' })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-8 flex flex-col gap-6 md:gap-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            Elyra Premium Shop
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">Dụng Cụ <span className="text-primary italic">Chuyên Nghiệp</span></h1>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg font-medium opacity-80 leading-relaxed">
            Trang bị tốt nhất để nâng tầm trận đấu của bạn. Sản phẩm chính hãng, bảo hành uy tín, giao hàng hỏa tốc.
          </p>
        </div>
      </div>

      <div className="sticky top-[72px] md:top-[80px] z-[120]">
        <div className="glass rounded-[32px] border-white/5 px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-4 md:gap-8 whitespace-nowrap">
              {['Sản phẩm', 'Thanh toán', 'Hoàn tất'].map((s, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                    (i === 0 && step === 'SELECT') || (i === 1 && step === 'REVIEW') || (i === 2 && step === 'CONFIRM')
                      ? 'bg-primary text-[#020617] scale-110'
                      : 'bg-white/5 text-slate-600'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors duration-500 ${
                    (i === 0 && step === 'SELECT') || (i === 1 && step === 'REVIEW') || (i === 2 && step === 'CONFIRM')
                      ? 'text-white'
                      : 'text-slate-700'
                  }`}>{s}</span>
                  {i < 2 && <div className={`w-4 md:w-10 h-0.5 rounded-full transition-colors duration-500 ${
                    (i === 0 && (step === 'REVIEW' || step === 'CONFIRM')) || (i === 1 && step === 'CONFIRM')
                      ? 'bg-primary'
                      : 'bg-white/5'
                  }`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {step === 'SELECT' && (
        <div className="glass rounded-[40px] border-white/5 p-4 md:p-6 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-6 relative group">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setVisible(12)
                }}
                placeholder="Tìm kiếm vợt, giày, phụ kiện..."
                className="input-standard !rounded-2xl !py-3 !pl-12 !text-sm border-white/10 focus:border-primary transition-all shadow-xl"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary text-lg">⌕</div>
            </div>
            <div className="lg:col-span-3">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setVisible(12)
                }}
                className="input-standard !rounded-2xl !py-3 !px-4 !text-xs font-black uppercase tracking-widest appearance-none border-white/10 focus:border-primary shadow-xl bg-[#020617]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'Tất cả danh mục' : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="input-standard !rounded-2xl !py-3 !px-4 !text-xs font-black uppercase tracking-widest appearance-none border-white/10 focus:border-primary shadow-xl bg-[#020617] flex-grow"
              >
                <option value="RELEVANCE">Phổ biến nhất</option>
                <option value="PRICE_ASC">Giá thấp → cao</option>
                <option value="PRICE_DESC">Giá cao → thấp</option>
                <option value="NAME_ASC">Tên A → Z</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly((v) => !v)
                  setVisible(12)
                }}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-xl ${
                  inStockOnly ? 'bg-primary border-primary text-[#020617]' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                }`}
                title="Chỉ hiện sản phẩm còn hàng"
              >
                📦
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Tìm thấy <span className="text-white">{filteredProducts.length}</span> sản phẩm
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
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Đặt lại bộ lọc ↺
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`${step === 'CONFIRM' ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8'} items-start`}>
        {/* Main Area */}
        <div className={`${step === 'CONFIRM' ? 'w-full' : 'lg:col-span-8'} overflow-hidden`}>
          <AnimatePresence mode="wait">
            {step === 'SELECT' ? (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5 md:gap-6"
              >
                {shownProducts.map((p) => (
                  <motion.div 
                    key={p.id} 
                    whileHover={{ y: -6 }}
                    className="group bg-[#0f172a]/40 border border-white/5 rounded-[32px] overflow-hidden flex flex-col transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <div 
                      className="aspect-[4/3] bg-white/[0.02] flex items-center justify-center text-6xl cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      {typeof p.image === 'string' && (p.image.startsWith('http') || p.image.startsWith('/')) ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="group-hover:scale-105 transition-transform duration-700">{p.image}</span>
                      )}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="px-3 py-1 rounded-xl bg-[#020617]/80 backdrop-blur-md border border-white/10 text-primary text-[9px] font-black uppercase tracking-widest shadow-xl">
                          {p.category}
                        </div>
                        {p.tag && (
                          <div className="px-3 py-1 rounded-xl bg-primary text-[#020617] text-[9px] font-black uppercase tracking-widest shadow-xl">
                            {p.tag}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-white font-black text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2" onClick={() => setSelectedProduct(p)}>
                          {p.name}
                        </h3>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed line-clamp-2 opacity-80">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="text-white font-black text-2xl tracking-tighter">{p.price.toLocaleString()}đ</div>
                          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest opacity-60">
                            Kho: {p.stock}
                          </div>
                        </div>

                        <div className="flex items-center bg-[#020617] rounded-xl p-1 border border-white/10 shadow-xl gap-1">
                          <button
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() =>
                              setCart((c) => ({ ...c, [p.id]: Math.max(0, (c[p.id] || 0) - 1) }))
                            }
                          >
                            −
                          </button>
                          <div className="w-8 text-center text-white font-black text-sm">{cart[p.id] || 0}</div>
                          <button
                            className="w-9 h-9 rounded-xl bg-primary text-[#020617] flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-primary/20"
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
                  </motion.div>
                ))}
              </motion.div>
            ) : step === 'REVIEW' ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 md:p-12 rounded-[40px] border-white/5 space-y-10 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Bước 2</div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Thông tin <span className="text-primary italic">Thanh toán</span></h2>
                  </div>
                  <button onClick={() => setCheckoutStep('SELECT')} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-primary hover:bg-primary hover:text-[#020617] transition-all border-white/10">←</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      {/* Checkout Mode Banner */}
                      <div className={`p-5 rounded-2xl border-2 ${checkoutMode === 'logged-in' ? 'bg-primary/10 border-primary/30' : 'bg-slate-800/50 border-white/10'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${checkoutMode === 'logged-in' ? 'bg-primary text-[#020617]' : 'bg-white/5 text-white'}`}>
                            {checkoutMode === 'logged-in' ? '👤' : '🏃'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CHẾ ĐỘ THANH TOÁN</span>
                            <span className={`text-sm font-black ${checkoutMode === 'logged-in' ? 'text-primary' : 'text-white'}`}>
                              {checkoutMode === 'logged-in' ? 'Thanh toán bằng tài khoản của bạn' : 'Mua hàng không cần tài khoản'}
                            </span>
                          </div>
                        </div>
                        {checkoutMode === 'logged-in' && user && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Đang sử dụng tài khoản: <span className="text-white font-black">{user.email}</span>
                          </p>
                        )}
                      </div>

                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thông tin nhận hàng</label>
                      <div className="space-y-4">
                        <div className="group">
                          <input
                            placeholder="Họ và tên người nhận"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value)
                              if (errors.fullName) setErrors((s) => ({ ...s, fullName: undefined }))
                            }}
                            className={`input-standard !rounded-2xl !py-4 !px-6 !text-sm border-white/10 focus:border-primary transition-all ${errors.fullName ? '!border-red-500/50' : ''}`}
                          />
                          {errors.fullName && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-red-400 text-[10px] font-black uppercase tracking-widest px-2">{errors.fullName}</motion.div>
                          )}
                        </div>
                        <div>
                          <input
                            placeholder="Số điện thoại liên lạc"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value)
                              if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }))
                            }}
                            className={`input-standard !rounded-2xl !py-4 !px-6 !text-sm border-white/10 focus:border-primary transition-all ${errors.phone ? '!border-red-500/50' : ''}`}
                          />
                          {errors.phone && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-red-400 text-[10px] font-black uppercase tracking-widest px-2">{errors.phone}</motion.div>
                          )}
                        </div>
                        <div>
                          <input
                            placeholder="Địa chỉ giao hàng chi tiết"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value)
                              if (errors.address) setErrors((s) => ({ ...s, address: undefined }))
                            }}
                            className={`input-standard !rounded-2xl !py-4 !px-6 !text-sm border-white/10 focus:border-primary transition-all ${errors.address ? '!border-red-500/50' : ''}`}
                          />
                          {errors.address && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-red-400 text-[10px] font-black uppercase tracking-widest px-2">{errors.address}</motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Ghi chú vận chuyển</label>
                      <textarea
                        placeholder="Thời gian nhận hàng, lưu ý cho shipper..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="input-standard !rounded-2xl min-h-[160px] !py-4 !px-6 !text-sm border-white/10 focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-8">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Phương thức thanh toán</label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'CASH', label: 'Tiền mặt', icon: '💵' },
                      { id: 'TRANSFER', label: 'Chuyển khoản', icon: '🏦' },
                      { id: 'CARD', label: 'Thẻ ATM/Visa', icon: '💳' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any)
                          setPayErrors({})
                        }}
                        className={`rounded-2xl border p-5 text-center transition-all flex flex-col items-center gap-2 ${
                          paymentMethod === m.id
                            ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10'
                            : 'bg-[#020617] border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">{m.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'TRANSFER' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-10 glass rounded-[32px] border-white/5 p-8">
                      <div className="md:col-span-4">
                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Quét mã QR</div>
                        <div className="w-full aspect-square rounded-3xl border border-white/10 bg-[#020617] flex items-center justify-center overflow-hidden shadow-2xl">
                          <img src={transferQrData} alt="QR chuyển khoản" className="w-full h-full object-cover p-2" />
                        </div>
                      </div>
                      <div className="md:col-span-8 space-y-6">
                        <div className="text-white font-black uppercase tracking-tight">Thông tin tài khoản</div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#020617] border border-white/10 shadow-xl">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nội dung</span>
                            <span className="text-primary font-black uppercase">ELYRA HUB | SHOP</span>
                          </div>
                          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#020617] border border-white/10 shadow-xl">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Số tiền</span>
                            <span className="text-white font-black text-xl">{Math.round(total).toLocaleString()}đ</span>
                          </div>
                        </div>
                        <div className="pt-4">
                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${transferConfirmed ? 'bg-primary border-primary text-[#020617]' : 'border-white/10 bg-[#020617] group-hover:border-primary/50'}`}>
                              {transferConfirmed && '✓'}
                            </div>
                            <input
                              type="checkbox"
                              checked={transferConfirmed}
                              onChange={(e) => {
                                setTransferConfirmed(e.target.checked)
                                if (payErrors.transfer) setPayErrors((s) => ({ ...s, transfer: undefined }))
                              }}
                              className="hidden"
                            />
                            <span className="text-white text-xs font-black uppercase tracking-widest">Tôi đã thực hiện chuyển khoản</span>
                          </label>
                          {payErrors.transfer && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-400 text-[10px] font-black uppercase tracking-widest px-2">{payErrors.transfer}</motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 md:p-24 rounded-[40px] border-white/5 text-center space-y-8 shadow-2xl"
              >
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-7xl mx-auto animate-bounce-slow">📦</div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Đã nhận <span className="text-primary italic">Đơn hàng!</span></h2>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Mã đơn của bạn: <span className="text-white font-black tracking-widest">#{doneId?.slice(0, 8).toUpperCase()}</span>. <br />
                    Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất.
                  </p>
                </div>
                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setCheckoutStep('SELECT')
                      setDoneId(null)
                    }}
                    className="px-12 py-5 bg-primary text-[#020617] font-black rounded-3xl shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary (hide when confirmed) */}
        {step !== 'CONFIRM' && (
          <div className="lg:col-span-4 space-y-6 sticky top-[150px]">
            <div className="glass rounded-[40px] border-white/5 p-8 shadow-2xl flex flex-col max-h-[75vh]">
              <div className="flex items-center justify-between shrink-0 mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Giỏ hàng</h2>
                {items.length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black">
                    {items.length} món
                  </div>
                )}
              </div>
              
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 flex-grow min-h-0 mb-6">
                {items.map((it) => {
                  const p = products.find((x) => x.id === it.productId)!;
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={it.productId}
                      className="flex items-center gap-4 group shrink-0"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 shadow-xl shrink-0 overflow-hidden flex items-center justify-center">
                        {typeof p.image === "string" && p.image.trim().length > 0 ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                              const parent = img.parentElement;
                              if (parent) {
                                const fallback = document.createElement("div");
                                fallback.className = "w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-2xl";
                                fallback.textContent = "🏸";
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-2xl">
                            🏸
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="text-white font-black text-xs line-clamp-2 uppercase tracking-tight">{it.name}</div>
                        <div className="text-slate-500 text-[9px] uppercase font-black tracking-widest flex items-center gap-2">
                          <span className="text-primary">{it.quantity}x</span> {it.price.toLocaleString()}đ
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-black text-xs tabular-nums">
                          {(it.quantity * it.price).toLocaleString()}đ
                        </div>
                        <button
                          onClick={() => {
                            setCart((c) => {
                              const newQty = Math.max(0, (c[p.id] || 0) - 1);
                              return { ...c, [p.id]: newQty };
                            });
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {items.length === 0 && (
                  <div className="py-12 text-center space-y-4 shrink-0">
                    <div className="text-5xl opacity-20 animate-pulse">🛒</div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Chưa có sản phẩm nào</div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5 shrink-0 mb-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="text-white tabular-nums">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="text-white tabular-nums">{shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-white font-black uppercase tracking-tighter text-lg">Tổng cộng</span>
                  <span className="text-primary font-black text-2xl tabular-nums tracking-tighter">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="pt-4 shrink-0">
                {step === 'SELECT' ? (
                  <motion.button
                    whileHover={items.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={items.length > 0 ? { scale: 0.98 } : {}}
                    className="w-full py-4 bg-primary text-[#020617] font-black rounded-2xl shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:grayscale transition-all"
                    disabled={items.length === 0}
                    onClick={() => {
                      if (items.length === 0) {
                        setNotification({ message: 'Vui lòng chọn ít nhất 1 sản phẩm', type: 'error' })
                        return
                      }
                      setCheckoutStep('REVIEW')
                    }}
                  >
                    Thanh toán ngay →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-primary text-[#020617] font-black rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:grayscale transition-all"
                    disabled={items.length === 0}
                    onClick={handleCheckout}
                  >
                    Xác nhận đơn hàng
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="glass rounded-3xl border-white/5 p-4 flex items-center gap-4 text-slate-500">
              <div className="text-2xl">🛡️</div>
              <div className="text-[9px] uppercase font-black tracking-[0.2em] leading-relaxed">
                Cam kết chính hãng 100% <br /> Hỗ trợ kỹ thuật trọn đời
              </div>
            </div>
          </div>
        )}
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
    </motion.div>
  )
}
