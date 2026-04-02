import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck, Clock } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { useReminderStore } from '../store'

export default function ReminderPanel() {
  const [open, setOpen] = useState(false)
  const { reminders, unreadCount, markRead, markAllRead } = useReminderStore()

  const TYPE_STYLE = {
    '3-day':    { label: '3 days before', color: 'bg-safe-light text-safe' },
    '1-day':    { label: '1 day before',  color: 'bg-warning-light text-warning' },
    'same-day': { label: 'Today!',        color: 'bg-urgent-light text-urgent' },
    'custom':   { label: 'Reminder',      color: 'bg-lavender-100 text-lavender-400' },
  }

  return (
    <>
      {/* Floating bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-blush-300 to-peach-300 shadow-warm text-white flex items-center justify-center z-40"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-urgent text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#231e2e] shadow-2xl z-50 flex flex-col border-l border-gray-100 dark:border-white/10"
            >
              {/* Header */}
              <div className="px-5 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-blush-400" />
                  <h3 className="font-display font-semibold text-gray-800 dark:text-white">Reminders</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-urgent-light text-urgent px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="p-1.5 rounded-xl text-gray-400 hover:text-safe hover:bg-safe-light transition-all" title="Mark all read">
                      <CheckCheck size={15} />
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Reminder list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">🔔</p>
                    <p className="text-sm text-gray-400 font-medium">No reminders yet</p>
                    <p className="text-xs text-gray-400 mt-1">They'll appear here when tasks have reminders set</p>
                  </div>
                ) : (
                  reminders.map((r, i) => {
                    const ts = TYPE_STYLE[r.type] || TYPE_STYLE.custom
                    const isdue = isPast(new Date(r.scheduledFor))
                    return (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          r.read
                            ? 'bg-gray-50 dark:bg-white/5 border-transparent opacity-60'
                            : 'bg-white dark:bg-white/10 border-gray-100 dark:border-white/20 shadow-soft'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${r.read ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                              {r.taskTitle}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ts.color}`}>{ts.label}</span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Clock size={9} />
                                {format(new Date(r.scheduledFor), 'MMM d, h:mm a')}
                              </span>
                            </div>
                          </div>
                          {!r.read && (
                            <button onClick={() => markRead(r._id)} className="p-1 rounded-lg text-gray-400 hover:text-safe hover:bg-safe-light transition-all flex-shrink-0">
                              <CheckCheck size={13} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
