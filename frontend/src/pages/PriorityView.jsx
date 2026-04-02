import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, Leaf, Trophy } from 'lucide-react'
import { useTaskStore, useUIStore } from '../store'
import { URGENCY_CONFIG, CATEGORY_CONFIG, getSmartTip, formatDue, formatCompleted } from '../utils/helpers'
import TaskCard from '../components/TaskCard'

const SECTIONS = [
  { urgency: 'red',    label: '🔴 Critical — Due within 48 hours',    icon: Zap,           sub: 'These need your attention RIGHT NOW' },
  { urgency: 'orange', label: '🟠 Urgent — Due this week',             icon: AlertTriangle, sub: 'Get a head start before it becomes critical' },
  { urgency: 'green',  label: '🟢 Upcoming — Next week and beyond',    icon: Leaf,          sub: 'Plan ahead and stay stress-free' },
]

export default function PriorityView() {
  const { tasks } = useTaskStore()
  const pending = tasks.filter(t => t.status === 'pending')
  const done    = tasks.filter(t => t.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="font-display text-3xl font-semibold text-gray-800 dark:text-white">Priority List</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tasks sorted automatically by urgency. Tackle the red ones first!</p>
      </motion.div>

      <div className="space-y-8">
        {SECTIONS.map(({ urgency, label, icon: Icon, sub }, si) => {
          const items = pending.filter(t => t.urgency === urgency)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

          return (
            <motion.section
              key={urgency}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${URGENCY_CONFIG[urgency].bg}`}>
                  <Icon size={15} className={URGENCY_CONFIG[urgency].color} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{label}</h3>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_CONFIG[urgency].bg} ${URGENCY_CONFIG[urgency].color}`}>
                  {items.length} task{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="card p-6 text-center text-sm text-gray-400"
                  >
                    {urgency === 'red' ? '🎉 No critical tasks right now!' :
                     urgency === 'orange' ? '✨ No urgent tasks this week.' :
                     '📅 No upcoming tasks yet. Add some!'}
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {items.map((task, i) => (
                      <TaskCard key={task._id} task={task} index={i} showTip />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.section>
          )
        })}

        {/* Completed section */}
        {done.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10">
                <Trophy size={15} className="text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-400 text-sm">✅ Completed</h3>
                <p className="text-xs text-gray-400">Great work!</p>
              </div>
              <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400">
                {done.length}
              </span>
            </div>
            <div className="space-y-3">
              {done.slice(0, 5).map((task, i) => (
                <TaskCard key={task._id} task={task} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
