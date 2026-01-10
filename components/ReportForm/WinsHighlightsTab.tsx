'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function WinsHighlightsTab({ data, updateData }: Props) {
  // Wins handlers
  const addWin = () => {
    const newWin = {
      id: Date.now().toString(),
      title: '',
      description: '',
    }
    updateData({ wins: [...data.wins, newWin] })
  }

  const updateWin = (id: string, field: 'title' | 'description', value: string) => {
    const updatedWins = data.wins.map((win) =>
      win.id === id ? { ...win, [field]: value } : win
    )
    updateData({ wins: updatedWins })
  }

  const removeWin = (id: string) => {
    if (data.wins.length <= 1) return
    updateData({ wins: data.wins.filter((win) => win.id !== id) })
  }

  // Good Jobs handlers
  const addGoodJob = () => {
    const newGoodJob = {
      id: Date.now().toString(),
      personName: '',
      reason: '',
    }
    updateData({ goodJobs: [...data.goodJobs, newGoodJob] })
  }

  const updateGoodJob = (id: string, field: 'personName' | 'reason', value: string) => {
    const updatedGoodJobs = data.goodJobs.map((gj) =>
      gj.id === id ? { ...gj, [field]: value } : gj
    )
    updateData({ goodJobs: updatedGoodJobs })
  }

  const removeGoodJob = (id: string) => {
    if (data.goodJobs.length <= 1) return
    updateData({ goodJobs: data.goodJobs.filter((gj) => gj.id !== id) })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Highlights & Wins</h2>

      {data.wins.map((win, index) => (
        <div key={win.id} className="bg-sonance-blue/10 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">Win #{index + 1}</span>
            {data.wins.length > 1 && (
              <button
                onClick={() => removeWin(win.id)}
                className="text-red-500 hover:text-red-700 text-sm uppercase tracking-wide"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              Win Title
            </label>
            <input
              type="text"
              value={win.title}
              onChange={(e) => updateWin(win.id, 'title', e.target.value)}
              placeholder="e.g., Closed Major Project"
              className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={win.description}
              onChange={(e) => updateWin(win.id, 'description', e.target.value)}
              placeholder="Describe the win and its impact..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addWin}
        className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide"
      >
        + Add Another Win
      </button>

      <div className="border-t border-card-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Follow-ups & Working On</h2>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Current Projects & Follow-ups
          </label>
          <textarea
            value={data.followUps}
            onChange={(e) => updateData({ followUps: e.target.value })}
            placeholder="List ongoing projects, follow-ups, and items in progress..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
          />
        </div>
      </div>

      {/* Good Job Section */}
      <div className="border-t border-card-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Good Job!</h2>
        <p className="text-sm text-foreground opacity-70 mb-4">
          Give a shout-out to team members or colleagues who helped you this period.
        </p>

        {data.goodJobs.map((goodJob, index) => (
          <div key={goodJob.id} className="bg-sonance-green/10 rounded-lg p-4 space-y-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground uppercase tracking-wide">Recognition #{index + 1}</span>
              {data.goodJobs.length > 1 && (
                <button
                  onClick={() => removeGoodJob(goodJob.id)}
                  className="text-red-500 hover:text-red-700 text-sm uppercase tracking-wide"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                Person Name
              </label>
              <input
                type="text"
                value={goodJob.personName}
                onChange={(e) => updateGoodJob(goodJob.id, 'personName', e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-green focus:border-sonance-green"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                What did they do?
              </label>
              <textarea
                value={goodJob.reason}
                onChange={(e) => updateGoodJob(goodJob.id, 'reason', e.target.value)}
                placeholder="Describe how they helped..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-green focus:border-sonance-green resize-none"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addGoodJob}
          className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide"
        >
          + Add Another Recognition
        </button>
      </div>
    </div>
  )
}
