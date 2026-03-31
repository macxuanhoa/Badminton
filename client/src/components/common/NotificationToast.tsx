import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationToast() {
  const notification = useStore((s) => s.notification)
  const setNotification = useStore((s) => s.setNotification)

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, setNotification])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-10 left-1/2 z-[1000] px-6 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 min-w-[300px] ${
            notification.type === 'success' 
              ? 'bg-primary/90 text-surface border-primary' 
              : 'bg-red-500/90 text-white border-red-400'
          }`}
        >
          <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
          <span className="font-bold text-sm tracking-tight">{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
