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
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Competitive Intelligence</h2>

      {data.competitors.map((competitor, index) => (
        <div key={competitor.id} className="bg-sonance-blue/10 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">Competitor #{index + 1}</span>
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
            <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              Competitor Name
            </label>
            <input
              type="text"
              value={competitor.name}
              onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
              placeholder="e.g., LEA Professional"
              className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              What We&apos;re Seeing
            </label>
            <textarea
              value={competitor.whatWereSeeing}
              onChange={(e) => updateCompetitor(competitor.id, 'whatWereSeeing', e.target.value)}
              placeholder="Describe competitive activity, wins/losses, market trends..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              Our Response/Strategy
            </label>
            <textarea
              value={competitor.ourResponse}
              onChange={(e) => updateCompetitor(competitor.id, 'ourResponse', e.target.value)}
              placeholder="How are we responding or planning to respond?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addCompetitor}
        className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide"
      >
        + Add Another Competitor
      </button>

      <div className="border-t border-card-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Market Trends</h2>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Key Market Observations
          </label>
          <textarea
            value={data.marketTrends}
            onChange={(e) => updateData({ marketTrends: e.target.value })}
            placeholder="What trends are you seeing in the market? Customer behaviors, pricing pressures, emerging opportunities..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
          />
        </div>
      </div>

      <div className="border-t border-card-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Industry Info</h2>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Industry News & Updates
          </label>
          <p className="text-xs text-foreground/60 mb-2">
            New competitor products, acquisitions, industry leadership changes, technology trends...
          </p>
          <textarea
            value={data.industryInfo || ''}
            onChange={(e) => updateData({ industryInfo: e.target.value })}
            placeholder="e.g., Fulcrum Acoustic introduced Driveflex amplifier line, Biamp acquired ClearOne patents, Extron launched new PoE ceiling speaker..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
          />
        </div>
      </div>
    </div>
  )
}
