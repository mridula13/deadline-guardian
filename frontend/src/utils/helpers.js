import { format, formatDistanceToNow, differenceInHours, differenceInDays, isPast } from 'date-fns'

// ─── Urgency helpers ──────────────────────────────────────────
export function getUrgency(dueDate) {
  const diff = differenceInHours(new Date(dueDate), new Date())
  if (diff < 0)   return 'red'
  if (diff <= 48)  return 'red'
  if (diff <= 168) return 'orange'
  return 'green'
}

export const URGENCY_CONFIG = {
  red: {
    label: 'Critical',
    color: 'text-urgent',
    bg: 'bg-urgent-light',
    border: 'border-urgent-border',
    ring: 'ring-urgent/20',
    dot: 'bg-urgent',
    shadow: 'shadow-glow-r',
    badge: 'badge-red',
    calClass: 'fc-event-red',
    left: 'border-l-4 border-l-urgent',
  },
  orange: {
    label: 'Urgent',
    color: 'text-warning',
    bg: 'bg-warning-light',
    border: 'border-warning-border',
    ring: 'ring-warning/20',
    dot: 'bg-warning',
    shadow: 'shadow-glow-o',
    badge: 'badge-orange',
    calClass: 'fc-event-orange',
    left: 'border-l-4 border-l-warning',
  },
  green: {
    label: 'On track',
    color: 'text-safe',
    bg: 'bg-safe-light',
    border: 'border-safe-border',
    ring: 'ring-safe/20',
    dot: 'bg-safe',
    shadow: 'shadow-glow-g',
    badge: 'badge-green',
    calClass: 'fc-event-green',
    left: 'border-l-4 border-l-safe',
  },
}

// ─── Smart tip messages ────────────────────────────────────────
export const RED_TIPS = [
  "⚡ Deadline is very close. Focus on key sections first — don't try to do everything.",
  "🔥 Try a 25-minute Pomodoro sprint right now. You'll be amazed what you can finish.",
  "🆘 Skip the outline — just start writing/doing. You can refine later.",
  "💡 What's the minimum viable submission? Start there. You can always improve.",
  "🚨 Ask for help NOW — classmate, teacher, or online resource. Don't wait.",
]

export const ORANGE_TIPS = [
  "✨ You're closer than you think! Block 2 focused hours today to get ahead.",
  "🌱 A little progress now saves a lot of panic later. Start today!",
  "📋 Make a quick task list for this subject — tick off 3 items by tonight.",
  "⏰ Set a personal deadline 1 day early. Future you will be so grateful.",
  "☕ Grab a coffee, put on some lo-fi, and knock this out this evening.",
]

export function getSmartTip(urgency) {
  const tips = urgency === 'red' ? RED_TIPS : ORANGE_TIPS
  return tips[Math.floor(Math.random() * tips.length)]
}

// ─── Date formatting ──────────────────────────────────────────
export function formatDue(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isPast(d)) return `Overdue (${format(d, 'MMM d')})`
  const days = differenceInDays(d, new Date())
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7)  return `Due in ${days} days`
  return `Due ${format(d, 'MMM d, yyyy')}`
}

export function formatCompleted(date) {
  if (!date) return ''
  return `Completed on ${format(new Date(date), 'MMM d, yyyy \'at\' h:mm a')}`
}

export function formatShort(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

// ─── Category config ──────────────────────────────────────────
export const CATEGORY_CONFIG = {
  exam:       { label: 'Exam',       color: 'bg-blush-100   text-blush-400',   emoji: '📝' },
  homework:   { label: 'Homework',   color: 'bg-lavender-100 text-lavender-400', emoji: '📚' },
  assignment: { label: 'Assignment', color: 'bg-peach-100   text-peach-400',    emoji: '📋' },
  project:    { label: 'Project',    color: 'bg-mint-100    text-mint-400',      emoji: '🚀' },
  lab:        { label: 'Lab',        color: 'bg-sand-100    text-yellow-500',    emoji: '🔬' },
  quiz:       { label: 'Quiz',       color: 'bg-rose-100    text-rose-400',      emoji: '🎯' },
  other:      { label: 'Other',      color: 'bg-gray-100    text-gray-500',      emoji: '📌' },
}

export const CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([value, meta]) => ({ value, ...meta }))
