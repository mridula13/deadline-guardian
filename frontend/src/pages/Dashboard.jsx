import { useEffect } from 'react'
import { motion } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'
import { differenceInHours, differenceInDays } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react'
import { useTaskStore, useUIStore } from '../store'
import { URGENCY_CONFIG, CATEGORY_CONFIG } from '../utils/helpers'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

export default function Dashboard() {
  const { tasks, analytics, fetchAnalytics, fetchDayTasks } = useTaskStore()
  const { openDayModal, openTaskModal } = useUIStore()

  useEffect(() => { fetchAnalytics() }, [tasks])

  // Build calendar events from tasks
  const calendarEvents = tasks.map(t => ({
    id: t._id,
    title: t.title,
    date: format(new Date(t.dueDate), 'yyyy-MM-dd'),
    classNames: [t.status === 'completed' ? 'fc-event-done' : `fc-event-${t.urgency}`],
    extendedProps: { task: t },
  }))

  const handleDateClick = async (info) => {
    await fetchDayTasks(info.dateStr)
    openDayModal()
  }

  const handleEventClick = async (info) => {
    const date = format(new Date(info.event.start), 'yyyy-MM-dd')
    await fetchDayTasks(date)
    openDayModal()
  }

  const stats = [
    { label: 'Total Tasks',  value: analytics?.total     || 0, icon: Clock,         color: 'from-lavender-100 to-blush-100',   text: 'text-lavender-400' },
    { label: 'Completed',    value: analytics?.completed || 0, icon: CheckCircle,    color: 'from-mint-100 to-safe-light',       text: 'text-safe' },
    { label: 'This Week',    value: analytics?.orange    || 0, icon: AlertTriangle,  color: 'from-peach-100 to-warning-light',   text: 'text-warning' },
    { label: 'Critical',     value: analytics?.red       || 0, icon: Zap,            color: 'from-blush-100 to-urgent-light',    text: 'text-urgent' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-gray-800 dark:text-white">
          Good {getGreeting()} 👋
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's what needs your attention
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i * 0.07)} className={`card p-5 bg-gradient-to-br ${s.color} border-0`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-3xl font-display font-semibold mt-1 ${s.text}`}>{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-2xl bg-white/60 flex items-center justify-center`}>
                <s.icon size={16} className={s.text} />
              </div>
            </div>
            {s.label === 'Completed' && analytics?.total > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((analytics.completed / analytics.total) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-safe rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{Math.round((analytics.completed / analytics.total) * 100)}% done</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div {...fadeUp(0.2)} className="xl:col-span-2 card p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{ left: 'prev', center: 'title', right: 'next today' }}
            height="auto"
            eventDisplay="block"
          />
        </motion.div>

        {/* Upcoming tasks sidebar */}
        <motion.div {...fadeUp(0.3)} className="card p-6">
          <h3 className="font-display font-semibold text-gray-700 dark:text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {tasks
              .filter(t => t.status === 'pending')
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 8)
              .map((task, i) => {
                const uc = URGENCY_CONFIG[task.urgency]
                const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => useUIStore.getState().openTaskModal(task)}
                    className={`p-3.5 rounded-2xl cursor-pointer hover:shadow-sm transition-all ${uc.bg} ${uc.border} border`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg leading-none mt-0.5">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{task.title}</p>
                        <p className={`text-xs mt-0.5 font-medium ${uc.color}`}>
                          {formatDueShort(task.dueDate)}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${uc.dot}`} />
                    </div>
                  </motion.div>
                )
              })}
            {tasks.filter(t => t.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-sm text-gray-400">All clear! No pending tasks.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDueShort(date) {
  const d = new Date(date)
  const now = new Date()
  const h = differenceInHours(d, now)
  if (h < 0)  return 'Overdue!'
  if (h < 24) return `Due in ${h}h`
  const days = differenceInDays(d, now)
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}
