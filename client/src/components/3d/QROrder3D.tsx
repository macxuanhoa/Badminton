import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const QROrder3D: React.FC = () => {
  const products = useStore((s) => s.products);
  const createOrder = useStore((s) => s.createOrder);
  const user = useStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<{ productId: string, name: string, price: number, quantity: number }[]>([]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;
    try {
      createOrder({
        fullName: user?.name || 'Khách Hub',
        phone: '0900000000',
        note: 'Order từ Cafe Hub QR',
        items: cart,
        total,
        tableNumber: 'CAFE-01'
      });
      setCart([]);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <group position={[0, 4, -25]}>
      <Html center>
        <div className="flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 border-indigo-600 pointer-events-auto"
          >
            <span className="text-3xl">☕</span>
          </motion.button>
          <div className="mt-2 glass px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
            Scan to Order
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="mt-4 glass-dark p-6 rounded-[32px] border-white/20 w-[320px] pointer-events-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black text-xl tracking-tighter uppercase">Cafe Hub <span className="text-indigo-500">Menu</span></h3>
                  <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {products.map(p => (
                    <div key={p.id} className="flex justify-between items-center glass p-3 rounded-2xl border-white/5">
                      <div>
                        <div className="text-white text-xs font-bold">{p.name}</div>
                        <div className="text-indigo-400 text-[10px] font-black">{p.price.toLocaleString()}đ</div>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all"
                      >+</button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 text-xs font-bold uppercase">Tổng cộng</span>
                      <span className="text-white font-black text-lg">{total.toLocaleString()}đ</span>
                    </div>
                    <button 
                      onClick={handleOrder}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl shadow-lg transition-all"
                    >XÁC NHẬN ORDER</button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
};
