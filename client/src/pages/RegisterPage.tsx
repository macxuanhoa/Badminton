import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export function RegisterPage() {
  const user = useStore((s) => s.user)
  const register = useStore((s) => s.register)
  const isLoading = useStore((s) => s.isLoading)
  const setNotification = useStore((s) => s.setNotification)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from as string | undefined

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({})

  if (user) {
    return <Navigate to={user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' : '/'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: { email?: string; password?: string; confirm?: string } = {}
    const emailTrim = email.trim().toLowerCase()
    if (!emailTrim) next.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) next.email = 'Email không hợp lệ'
    if (!password || password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại không khớp'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    try {
      await register({ email: emailTrim, password, name: name.trim() || undefined, phone: phone.trim() || undefined })
      setNotification({ message: 'Tạo tài khoản thành công', type: 'success' })
      navigate(from || '/')
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || err.message || 'Đăng ký thất bại', type: 'error' })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark w-full max-w-md rounded-[32px] border border-white/10 p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-app font-bold text-3xl tracking-tight uppercase">ELYRA <span className="text-primary italic">HUB</span></h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Tạo tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-standard">Email</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((s) => ({ ...s, email: undefined }))
              }}
              className={`input-standard ${errors.email ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="name@example.com"
            />
            {errors.email && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.email}</div>}
          </div>

          <div>
            <label className="label-standard">Họ và tên (tuỳ chọn)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-standard" placeholder="Nguyễn Văn A" />
          </div>

          <div>
            <label className="label-standard">Số điện thoại (tuỳ chọn)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-standard" placeholder="090..." />
          </div>

          <div>
            <label className="label-standard">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((s) => ({ ...s, password: undefined }))
              }}
              className={`input-standard ${errors.password ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="Tối thiểu 8 ký tự"
            />
            {errors.password && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.password}</div>}
          </div>

          <div>
            <label className="label-standard">Nhập lại mật khẩu</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (errors.confirm) setErrors((s) => ({ ...s, confirm: undefined }))
              }}
              className={`input-standard ${errors.confirm ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="Nhập lại"
            />
            {errors.confirm && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.confirm}</div>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 shadow-xl shadow-primary-glow/20 disabled:opacity-50">
            {isLoading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Đã có tài khoản? <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
          </p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-3">
            Quên mật khẩu? <Link to="/forgot-password" className="text-primary hover:underline">Khôi phục</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

