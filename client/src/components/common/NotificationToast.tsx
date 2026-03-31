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
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          className="fixed top-[92px] right-6 z-[1000] w-[320px] max-w-[calc(100vw-48px)]"
        >
          <div
            className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-primary/10 border-primary/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                notification.type === 'success' ? 'bg-primary' : 'bg-red-500'
              }`}
            />
            <div className="px-4 py-3 flex items-start gap-3">
              <div
                className={`mt-0.5 w-2 h-2 rounded-full ${
                  notification.type === 'success' ? 'bg-primary' : 'bg-red-500'
                }`}
              />
              <div className="min-w-0">
                <div className="text-white text-[11px] font-semibold leading-relaxed tracking-tight">
                  {notification.message}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
