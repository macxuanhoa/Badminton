import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import { useStore } from '../store/useStore'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setNotification = useStore((s) => s.setNotification)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailTrim = email.trim().toLowerCase()
    if (!emailTrim) {
      setError('Vui lòng nhập email')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError('Email không hợp lệ')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email: emailTrim })
      const token = res.data?.resetToken as string | undefined
      setNotification({ message: 'Đã tạo yêu cầu khôi phục mật khẩu', type: 'success' })
      if (token) {
        navigate(`/reset-password?email=${encodeURIComponent(emailTrim)}&token=${encodeURIComponent(token)}`)
      }
    } catch (e: any) {
      setNotification({ message: e.response?.data?.message || e.message || 'Không thể khôi phục mật khẩu', type: 'error' })
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
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Khôi phục mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-standard">Email</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              className={`input-standard ${error ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="name@example.com"
            />
            {error && <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{error}</div>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 shadow-xl shadow-primary-glow/20 disabled:opacity-50">
            {loading ? 'ĐANG TẠO...' : 'TẠO LINK KHÔI PHỤC'}
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

