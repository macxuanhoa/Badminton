import { useEffect, useMemo, useState } from 'react'
import { useStore, type ProductRecord } from '../../store/useStore'

export function AdminProductsPage() {
  const products = useStore((s) => s.products)
  const fetchProducts = useStore((s) => s.fetchProducts)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const isLoading = useStore((s) => s.isLoading)
  const setNotification = useStore((s) => s.setNotification)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRecord | null>(null)
  const [errors, setErrors] = useState<{ name?: string; category?: string; price?: string; stock?: string; minStock?: string; image?: string }>({})
  const [form, setForm] = useState<Omit<ProductRecord, 'id'>>({
    name: '',
    category: 'Vợt Cầu Lông',
    price: 0,
    stock: 0,
    minStock: 0,
    image: '🏸',
    description: '',
    tag: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const rows = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const openCreate = () => {
    setEditing(null)
    setErrors({})
    setForm({
      name: '',
      category: 'Vợt Cầu Lông',
      price: 0,
      stock: 0,
      minStock: 0,
      image: '🏸',
      description: '',
      tag: '',
    })
    setOpen(true)
  }

  const openEdit = (p: ProductRecord) => {
    setEditing(p)
    setErrors({})
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      minStock: p.minStock || 0,
      image: p.image || '🏸',
      description: p.description || '',
      tag: p.tag || '',
    })
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin</div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">Sản phẩm</h1>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Thêm sản phẩm
        </button>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr className="text-[10px] text-muted font-bold uppercase tracking-widest">
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Tồn</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((p) => (
                <tr key={p.id} className="text-[12px]">
                  <td className="px-4 py-3 text-white font-bold">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3 text-right text-white font-bold">{p.price.toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-right text-white">{p.stock}</td>
                  <td className="px-4 py-3 text-right text-muted">{p.minStock || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => openEdit(p)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn-secondary !px-3 !py-2 !text-[10px]"
                        onClick={async () => {
                          try {
                            await deleteProduct(p.id)
                            setNotification({ message: 'Đã xóa sản phẩm', type: 'success' })
                          } catch (e: any) {
                            setNotification({ message: e.message || 'Lỗi xóa sản phẩm', type: 'error' })
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass-dark w-full max-w-2xl rounded-[28px] border border-white/10 p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Product</div>
                <h2 className="text-white text-xl font-bold tracking-tight uppercase">
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </h2>
              </div>
              <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => setOpen(false)}>
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-standard">Tên</label>
                <input
                  className={`input-standard ${errors.name ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, name: e.target.value }))
                    if (errors.name) setErrors((s) => ({ ...s, name: undefined }))
                  }}
                />
                {errors.name && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.name}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Danh mục</label>
                <input
                  className={`input-standard ${errors.category ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.category}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, category: e.target.value }))
                    if (errors.category) setErrors((s) => ({ ...s, category: undefined }))
                  }}
                />
                {errors.category && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.category}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Giá</label>
                <input
                  className={`input-standard ${errors.price ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  type="number"
                  value={form.price}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, price: Number(e.target.value) }))
                    if (errors.price) setErrors((s) => ({ ...s, price: undefined }))
                  }}
                />
                {errors.price && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.price}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Tồn kho</label>
                <input
                  className={`input-standard ${errors.stock ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  type="number"
                  value={form.stock}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, stock: Number(e.target.value) }))
                    if (errors.stock) setErrors((s) => ({ ...s, stock: undefined }))
                  }}
                />
                {errors.stock && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.stock}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Min Stock</label>
                <input
                  className={`input-standard ${errors.minStock ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  type="number"
                  value={form.minStock || 0}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, minStock: Number(e.target.value) }))
                    if (errors.minStock) setErrors((s) => ({ ...s, minStock: undefined }))
                  }}
                />
                {errors.minStock && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.minStock}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Icon</label>
                <input
                  className={`input-standard ${errors.image ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.image || ''}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, image: e.target.value }))
                    if (errors.image) setErrors((s) => ({ ...s, image: undefined }))
                  }}
                />
                {errors.image && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.image}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="label-standard">Mô tả</label>
                <textarea className="input-standard min-h-[96px]" value={form.description || ''} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label-standard">Tag</label>
                <input className="input-standard" value={form.tag || ''} onChange={(e) => setForm((s) => ({ ...s, tag: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isLoading || !form.name.trim()}
                onClick={async () => {
                  try {
                    const next: { name?: string; category?: string; price?: string; stock?: string; minStock?: string; image?: string } = {}
                    if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm'
                    if (!form.category.trim()) next.category = 'Vui lòng nhập danh mục'
                    if (!Number.isFinite(form.price) || form.price <= 0) next.price = 'Giá phải lớn hơn 0'
                    if (!Number.isFinite(form.stock) || form.stock < 0) next.stock = 'Tồn kho không hợp lệ'
                    if (form.minStock !== undefined && (!Number.isFinite(form.minStock) || Number(form.minStock) < 0)) next.minStock = 'Min Stock không hợp lệ'
                    if (!String(form.image || '').trim()) next.image = 'Vui lòng nhập icon hoặc URL ảnh'
                    setErrors(next)
                    if (Object.keys(next).length > 0) return
                    if (editing) {
                      await updateProduct(editing.id, form)
                      setNotification({ message: 'Đã cập nhật sản phẩm', type: 'success' })
                    } else {
                      await addProduct(form)
                      setNotification({ message: 'Đã thêm sản phẩm', type: 'success' })
                    }
                    setOpen(false)
                  } catch (e: any) {
                    setNotification({ message: e.message || 'Lỗi lưu sản phẩm', type: 'error' })
                  }
                }}
              >
                {isLoading ? 'ĐANG LƯU...' : 'LƯU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
