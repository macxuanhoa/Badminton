import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import { useStore } from '../store/useStore'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export function ResetPasswordPage() {
  const query = useQuery()
  const email = query.get('email') || ''
  const token = query.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; base?: string }>({})
  const [loading, setLoading] = useState(false)
  const setNotification = useStore((s) => s.setNotification)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: { password?: string; confirm?: string; base?: string } = {}
    if (!email || !token) next.base = 'Link khôi phục không hợp lệ'
    if (!password || password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại không khớp'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: password })
      setNotification({ message: 'Đã đặt lại mật khẩu', type: 'success' })
      navigate('/login')
    } catch (e: any) {
      setNotification({ message: e.response?.data?.message || e.message || 'Không thể đặt lại mật khẩu', type: 'error' })
    } finally {
      setLoading(false)
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
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Đặt lại mật khẩu</p>
        </div>

        {errors.base && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest py-3 text-center rounded-xl">
            {errors.base}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-standard">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((s) => ({ ...s, password: undefined }))
              }}
              className={`input-standard ${errors.password ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="Tối thiểu 8 ký tự"
              disabled={!email || !token}
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
              disabled={!email || !token}
            />
            {errors.confirm && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.confirm}</div>}
          </div>

          <button type="submit" disabled={loading || !email || !token} className="btn-primary w-full py-4 shadow-xl shadow-primary-glow/20 disabled:opacity-50">
            {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT MẬT KHẨU'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Quay lại <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

