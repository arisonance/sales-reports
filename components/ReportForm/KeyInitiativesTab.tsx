'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function KeyInitiativesTab({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Major Projects & Initiatives</h2>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
          Key Projects Update
        </label>
        <textarea
          value={data.keyProjects}
          onChange={(e) => updateData({ keyProjects: e.target.value })}
          placeholder="Update on major projects (e.g., Starbucks rollout, Wynn Dubai, Red Thread partnership...)"
          rows={5}
          className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
          Distribution & Partnership Updates
        </label>
        <textarea
          value={data.distributionUpdates}
          onChange={(e) => updateData({ distributionUpdates: e.target.value })}
          placeholder="Updates on distributor relationships, new partnerships, transitions..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
          Challenges & Blockers
        </label>
        <textarea
          value={data.challengesBlockers}
          onChange={(e) => updateData({ challengesBlockers: e.target.value })}
          placeholder="What obstacles or challenges need attention?"
          rows={5}
          className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
        />
      </div>
    </div>
  )
}
