'use client'

import { useState } from 'react'
import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function BasicInfoTab({ data, updateData }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorName: data.directorName,
          region: data.region,
          month: data.month,
          wins: data.wins,
          followUps: data.followUps,
          monthlySales: data.monthlySales,
          monthlyGoal: data.monthlyGoal,
          ytdSales: data.ytdSales,
          ytdGoal: data.ytdGoal,
          openOrders: data.openOrders,
          pipeline: data.pipeline,
          repFirms: data.repFirms,
          competitors: data.competitors,
          marketTrends: data.marketTrends,
          industryInfo: data.industryInfo,
          keyProjects: data.keyProjects,
          distributionUpdates: data.distributionUpdates,
          challengesBlockers: data.challengesBlockers,
          eventsAttended: data.eventsAttended,
          marketingCampaigns: data.marketingCampaigns,
          goodJobs: data.goodJobs,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate summary')
      }

      updateData({ executiveSummary: result.summary })
    } catch (error) {
      console.error('Error generating summary:', error)
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate summary')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Report Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.directorName}
            readOnly
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-muted/30 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Report Month <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            value={data.month}
            onChange={(e) => updateData({ month: e.target.value })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Region <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.region}
            readOnly
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-muted/30 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            readOnly
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-muted/30 text-foreground"
          />
        </div>
      </div>

      <div className="border-t border-card-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Executive Summary</h2>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              isGenerating
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-sonance-blue text-white hover:bg-sonance-blue/90 shadow-md hover:shadow-lg'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>

        {generateError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {generateError}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Overall Business Summary
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Fill out other sections first, then click &quot;Generate with AI&quot; to create a summary, or write your own.
          </p>
          <textarea
            value={data.executiveSummary}
            onChange={(e) => updateData({ executiveSummary: e.target.value })}
            placeholder="Provide a high-level overview of the month's performance, key achievements, and challenges..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
          />
        </div>
      </div>
    </div>
  )
}
