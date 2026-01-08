'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function KeyInitiativesTab({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">Major Projects & Initiatives</h2>

      <div>
        <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
          Key Projects Update
        </label>
        <textarea
          value={data.keyProjects}
          onChange={(e) => updateData({ keyProjects: e.target.value })}
          placeholder="Update on major projects (e.g., Starbucks rollout, Wynn Dubai, Red Thread partnership...)"
          rows={5}
          className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
          Distribution & Partnership Updates
        </label>
        <textarea
          value={data.distributionUpdates}
          onChange={(e) => updateData({ distributionUpdates: e.target.value })}
          placeholder="Updates on distributor relationships, new partnerships, transitions..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
          Challenges & Blockers
        </label>
        <textarea
          value={data.challengesBlockers}
          onChange={(e) => updateData({ challengesBlockers: e.target.value })}
          placeholder="What obstacles or challenges need attention?"
          rows={5}
          className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
        />
      </div>
    </div>
  )
}
