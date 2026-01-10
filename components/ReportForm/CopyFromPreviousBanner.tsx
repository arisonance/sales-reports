'use client'

interface Props {
  previousMonth: string
  onCopy: () => void
  onDismiss: () => void
}

export default function CopyFromPreviousBanner({ previousMonth, onCopy, onDismiss }: Props) {
  return (
    <div className="bg-sonance-blue/10 border-l-4 border-sonance-blue px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-sonance-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-foreground">
          You have data from <span className="font-semibold">{previousMonth}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="px-3 py-1.5 text-sm font-semibold text-sonance-blue hover:bg-sonance-blue/10 rounded transition-colors uppercase tracking-wide"
        >
          Copy recurring data
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-foreground/50 hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
