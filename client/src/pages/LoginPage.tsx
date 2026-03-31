import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore((s) => s.login);
  const isLoading = useStore((s) => s.isLoading);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
          <h1 className="text-white font-bold text-3xl tracking-tight uppercase">ELYRA <span className="text-primary italic">HUB</span></h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Đăng nhập hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest py-3 text-center rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="label-standard">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-standard"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="label-standard">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-standard"
              placeholder="••••••••"
              required
            />
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
            Chưa có tài khoản? <Link to="/" className="text-primary hover:underline">Liên hệ quản trị</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
