// Small shared UI primitives reused across the info cards.
// Keeping these here avoids repeating markup in every *Card component.

/**
 * A labelled stat row with an icon.
 * @param {JSX.Element} props.icon
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 */
export function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2 dark:bg-slate-700/40">
      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-lg text-emerald-600 dark:text-emerald-400">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  )
}

// Colour presets for badges keyed by a semantic tone.
const BADGE_TONES = {
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  slate: 'bg-slate-200 text-slate-700 dark:bg-slate-600/40 dark:text-slate-200',
}

/**
 * Coloured pill badge.
 * @param {'green'|'yellow'|'red'|'blue'|'slate'} props.tone
 */
export function Badge({ tone = 'slate', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  )
}

/**
 * Maps a qualitative level (Low/Medium/High) to a badge tone.
 * Used by nutrient levels and disease risk.
 */
export function levelTone(level = '') {
  const l = String(level).toLowerCase()
  if (l === 'high') return 'red'
  if (l === 'medium') return 'yellow'
  if (l === 'low') return 'green'
  return 'slate'
}

/** A card shell with a titled header. */
export function CardShell({ title, icon, children, className = '' }) {
  return (
    <section className={`glass-card animate-fade-in flex flex-col p-4 ${className}`}>
      <h3 className="panel-title mb-3">
        {icon}
        {title}
      </h3>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </section>
  )
}
