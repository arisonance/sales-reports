'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function CompetitionTab({ data, updateData }: Props) {
  const addCompetitor = () => {
    const newCompetitor = {
      id: Date.now().toString(),
      name: '',
      whatWereSeeing: '',
      ourResponse: '',
    }
    updateData({ competitors: [...data.competitors, newCompetitor] })
  }

  const updateCompetitor = (id: string, field: string, value: string) => {
    const updatedCompetitors = data.competitors.map((comp) =>
      comp.id === id ? { ...comp, [field]: value } : comp
    )
    updateData({ competitors: updatedCompetitors })
  }

  const removeCompetitor = (id: string) => {
    if (data.competitors.length <= 1) return
    updateData({ competitors: data.competitors.filter((comp) => comp.id !== id) })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">Competitive Intelligence</h2>

      {data.competitors.map((competitor, index) => (
        <div key={competitor.id} className="bg-[#00A3E1]/10 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#333F48] uppercase tracking-wide">Competitor #{index + 1}</span>
            {data.competitors.length > 1 && (
              <button
                onClick={() => removeCompetitor(competitor.id)}
                className="text-red-500 hover:text-red-700 text-sm uppercase tracking-wide"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
              Competitor Name
            </label>
            <input
              type="text"
              value={competitor.name}
              onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
              placeholder="e.g., LEA Professional"
              className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
              What We&apos;re Seeing
            </label>
            <textarea
              value={competitor.whatWereSeeing}
              onChange={(e) => updateCompetitor(competitor.id, 'whatWereSeeing', e.target.value)}
              placeholder="Describe competitive activity, wins/losses, market trends..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
              Our Response/Strategy
            </label>
            <textarea
              value={competitor.ourResponse}
              onChange={(e) => updateCompetitor(competitor.id, 'ourResponse', e.target.value)}
              placeholder="How are we responding or planning to respond?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addCompetitor}
        className="px-4 py-2 bg-[#00B2A9] text-white rounded-lg hover:bg-[#009990] transition-colors font-semibold uppercase tracking-wide"
      >
        + Add Another Competitor
      </button>

      <div className="border-t border-[#D9D9D6] pt-6">
        <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Market Trends</h2>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Key Market Observations
          </label>
          <textarea
            value={data.marketTrends}
            onChange={(e) => updateData({ marketTrends: e.target.value })}
            placeholder="What trends are you seeing in the market? Customer behaviors, pricing pressures, emerging opportunities..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] resize-none"
          />
        </div>
      </div>
    </div>
  )
}
