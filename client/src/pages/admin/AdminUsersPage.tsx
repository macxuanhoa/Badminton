import { useEffect, useState } from 'react'
import api from '../../api'
import { useStore } from '../../store/useStore'

type UserRow = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  role: string
  membership: string
  walletBalance: number
  points: number
  createdAt: string
}

export function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [saving, setSaving] = useState(false)
  const setNotification = useStore((s) => s.setNotification)
  const [errors, setErrors] = useState<{ name?: string; phone?: string; walletBalance?: string; points?: string }>({})
  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '')

  const [form, setForm] = useState({
    role: 'USER',
    membership: 'BASIC',
    walletBalance: 0,
    points: 0,
    name: '',
    phone: '',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/users')
        if (mounted) setRows(res.data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest">Admin</div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">Người dùng</h1>
        </div>
        <div className="text-muted text-[11px] font-medium">
          {loading ? 'Đang tải...' : `${rows.length} bản ghi`}
        </div>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr className="text-[10px] text-muted font-bold uppercase tracking-widest">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3 text-right">Ví</th>
                <th className="px-4 py-3 text-right">Điểm</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((u) => (
                <tr key={u.id} className="text-[12px]">
                  <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-white">{u.name || '-'}</td>
                  <td className="px-4 py-3 text-muted">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-muted">{u.role}</td>
                  <td className="px-4 py-3 text-muted">{u.membership}</td>
                  <td className="px-4 py-3 text-right text-white font-bold">{Number(u.walletBalance).toLocaleString()}đ</td>
                  <td className="px-4 py-3 text-right text-primary font-bold">{u.points}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-2 !text-[10px]"
                      onClick={() => {
                        setEditing(u)
                        setErrors({})
                        setForm({
                          role: u.role,
                          membership: u.membership,
                          walletBalance: Number(u.walletBalance || 0),
                          points: Number(u.points || 0),
                          name: u.name || '',
                          phone: u.phone || '',
                        })
                      }}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-dark w-full max-w-xl rounded-[28px] border border-white/10 p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-primary text-[10px] font-bold uppercase tracking-widest">User</div>
                <h2 className="text-white text-xl font-bold tracking-tight uppercase">Cập nhật tài khoản</h2>
              </div>
              <button type="button" className="btn-secondary !px-3 !py-2 !text-[10px]" onClick={() => setEditing(null)}>
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-standard">Email</label>
                <input className="input-standard opacity-60 cursor-not-allowed" value={editing.email} disabled />
              </div>
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
                <label className="label-standard">SĐT</label>
                <input
                  className={`input-standard ${errors.phone ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  value={form.phone}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, phone: e.target.value }))
                    if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }))
                  }}
                />
                {errors.phone && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.phone}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Role</label>
                <select className="input-standard" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
                  {['USER', 'STAFF', 'ADMIN'].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-standard">Membership</label>
                <select className="input-standard" value={form.membership} onChange={(e) => setForm((s) => ({ ...s, membership: e.target.value }))}>
                  {['BASIC', 'SILVER', 'GOLD', 'PLATINUM'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-standard">Ví</label>
                <input
                  className={`input-standard ${errors.walletBalance ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  type="number"
                  value={form.walletBalance}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, walletBalance: Number(e.target.value) }))
                    if (errors.walletBalance) setErrors((s) => ({ ...s, walletBalance: undefined }))
                  }}
                />
                {errors.walletBalance && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.walletBalance}</div>
                )}
              </div>
              <div>
                <label className="label-standard">Điểm</label>
                <input
                  className={`input-standard ${errors.points ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
                  type="number"
                  value={form.points}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, points: Number(e.target.value) }))
                    if (errors.points) setErrors((s) => ({ ...s, points: undefined }))
                  }}
                />
                {errors.points && (
                  <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.points}</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={saving}
                onClick={async () => {
                  try {
                    const next: { name?: string; phone?: string; walletBalance?: string; points?: string } = {}
                    const nameTrim = String(form.name || '').trim()
                    const phoneTrim = String(form.phone || '').trim()
                    const phoneNorm = phoneTrim ? normalizePhone(phoneTrim) : ''
                    if (!nameTrim) next.name = 'Vui lòng nhập tên'
                    if (phoneTrim && (phoneNorm.length < 9 || phoneNorm.length > 11)) next.phone = 'Số điện thoại không hợp lệ'
                    if (!Number.isFinite(form.walletBalance) || form.walletBalance < 0) next.walletBalance = 'Ví không hợp lệ'
                    if (!Number.isFinite(form.points) || form.points < 0) next.points = 'Điểm không hợp lệ'
                    setErrors(next)
                    if (Object.keys(next).length > 0) return
                    setSaving(true)
                    const res = await api.patch(`/users/${editing.id}`, {
                      role: form.role,
                      membership: form.membership,
                      walletBalance: form.walletBalance,
                      points: Math.floor(form.points),
                      name: nameTrim || null,
                      phone: phoneNorm || null,
                    })
                    setRows((prev) => prev.map((x) => (x.id === editing.id ? res.data : x)))
                    setEditing(null)
                    setNotification({ message: 'Đã cập nhật tài khoản', type: 'success' })
                  } catch (e: any) {
                    setNotification({ message: e.response?.data?.message || e.message || 'Lỗi cập nhật tài khoản', type: 'error' })
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                {saving ? 'ĐANG LƯU...' : 'LƯU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
