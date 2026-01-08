'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function BasicInfoTab({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">Report Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.directorName}
            readOnly
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-[#D9D9D6]/30 text-[#333F48]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Report Month <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            value={data.month}
            onChange={(e) => updateData({ month: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Region <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.region}
            readOnly
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-[#D9D9D6]/30 text-[#333F48]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            readOnly
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-[#D9D9D6]/30 text-[#333F48]"
          />
        </div>
      </div>

      <div className="border-t border-[#D9D9D6] pt-6">
        <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Executive Summary</h2>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Overall Business Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.executiveSummary}
            onChange={(e) => updateData({ executiveSummary: e.target.value })}
            placeholder="Provide a high-level overview of the month's performance, key achievements, and challenges..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
          />
        </div>
      </div>
    </div>
  )
}
