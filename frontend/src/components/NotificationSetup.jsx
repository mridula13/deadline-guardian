import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'

export default function NotificationSetup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // Show prompt after 3 seconds
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  const allow = () => {
    Notification.requestPermission().then(p => {
      if (p === 'granted') {
        new Notification('🛡️ Deadline Guardian', { body: 'Notifications enabled! We\'ll remind you before deadlines.' })
      }
    })
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-20 right-6 z-50 bg-white dark:bg-[#231e2e] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/20 p-4 w-72"
        >
          <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X size={14} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blush-100 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-blush-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Enable reminders?</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Get browser notifications before your deadlines hit.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={allow} className="btn-primary text-xs py-1.5 px-3">Allow</button>
                <button onClick={() => setShow(false)} className="btn-ghost text-xs py-1.5 px-3">Later</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
