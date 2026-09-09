// Skeleton loaders used while mocked API promises resolve.
// A single shimmer block that we compose into card-shaped skeletons.

/** One shimmering placeholder bar. */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-slate-200/70 dark:bg-slate-700/50 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  )
}

/** Skeleton shaped like one of the bottom info cards. */
export function CardSkeleton() {
  return (
    <div className="glass-card animate-fade-in p-4">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  )
}

/** A row of card skeletons for the dashboard's bottom strip. */
export default function Loading({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  )
}
