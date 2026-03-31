import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const login = useStore((s) => s.login);
  const user = useStore((s) => s.user);
  const isLoading = useStore((s) => s.isLoading);
  const setNotification = useStore((s) => s.setNotification)
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' : '/'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; password?: string } = {}
    const emailTrim = email.trim()
    if (!emailTrim) next.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) next.email = 'Email không hợp lệ'
    if (!password) next.password = 'Vui lòng nhập mật khẩu'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    try {
      await login(emailTrim, password);
      navigate(from || '/');
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.', type: 'error' })
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark w-full max-w-md rounded-[32px] border border-white/10 p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-app font-bold text-3xl tracking-tight uppercase">ELYRA <span className="text-primary italic">HUB</span></h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Đăng nhập hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-standard">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((s) => ({ ...s, email: undefined }))
              }}
              className={`input-standard ${errors.email ? '!border-red-500/40 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
              placeholder="name@example.com"
            />
            {errors.email && (
              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.email}</div>
            )}
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
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="mt-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.password}</div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full py-4 shadow-xl shadow-primary-glow/20 disabled:opacity-50"
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP NGAY'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Chưa có tài khoản? <Link to="/register" className="text-primary hover:underline">Đăng ký</Link>
          </p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-3">
            Quên mật khẩu? <Link to="/forgot-password" className="text-primary hover:underline">Khôi phục</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
