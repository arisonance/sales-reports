'use client'

import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (includeGoodJobs: boolean) => void
  previousMonth: string
  repFirmNames: string[]
  competitorNames: string[]
  goodJobsNames: string[]
}

export default function CopyFromPreviousModal({
  isOpen,
  onClose,
  onConfirm,
  previousMonth,
  repFirmNames,
  competitorNames,
  goodJobsNames
}: Props) {
  const [includeGoodJobs, setIncludeGoodJobs] = useState(false)

  if (!isOpen) return null

  const hasRepFirms = repFirmNames.length > 0
  const hasCompetitors = competitorNames.length > 0
  const hasGoodJobs = goodJobsNames.length > 0
  const hasAnyData = hasRepFirms || hasCompetitors

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card-bg rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Sonance Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-1 uppercase tracking-wide">
            Copy from {previousMonth}
          </h2>
          <p className="text-sm text-foreground/70 mb-4">
            Pre-fill recurring data. Numbers and analysis will not be copied.
          </p>

          {!hasAnyData ? (
            <div className="bg-muted/30 rounded-lg p-4 text-center text-foreground/70">
              No recurring data found in previous report.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rep Firms */}
              {hasRepFirms && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Rep Firms ({repFirmNames.length})
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <ul className="text-sm text-foreground space-y-1">
                      {repFirmNames.map((name, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sonance-blue rounded-full"></span>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Competitors */}
              {hasCompetitors && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Competitors ({competitorNames.length})
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <ul className="text-sm text-foreground space-y-1">
                      {competitorNames.map((name, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sonance-blue rounded-full"></span>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Good Jobs (optional) */}
              {hasGoodJobs && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGoodJobs}
                      onChange={(e) => setIncludeGoodJobs(e.target.checked)}
                      className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                    />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Also copy Good Jobs names ({goodJobsNames.length})
                    </span>
                  </label>
                  {includeGoodJobs && (
                    <div className="bg-muted/30 rounded-lg p-3 mt-2 ml-7">
                      <ul className="text-sm text-foreground space-y-1">
                        {goodJobsNames.map((name, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-sonance-green rounded-full"></span>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <p className="text-xs text-foreground/50 mt-4 italic">
            Numbers will be reset to 0. Analysis text will be cleared.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-card-border text-foreground font-semibold rounded-lg hover:bg-muted/30 transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(includeGoodJobs)}
              disabled={!hasAnyData}
              className="flex-1 py-3 bg-sonance-blue text-white font-semibold rounded-lg hover:bg-sonance-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              Copy Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
