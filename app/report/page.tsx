'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Tab components
import BasicInfoTab from '@/components/ReportForm/BasicInfoTab'
import WinsHighlightsTab from '@/components/ReportForm/WinsHighlightsTab'
import SalesDataTab from '@/components/ReportForm/SalesDataTab'
import CompetitionTab from '@/components/ReportForm/CompetitionTab'
import MarketingEventsTab from '@/components/ReportForm/MarketingEventsTab'
import CopyFromPreviousBanner from '@/components/ReportForm/CopyFromPreviousBanner'
import CopyFromPreviousModal from '@/components/ReportForm/CopyFromPreviousModal'
import { octoberReports } from '@/lib/test-data/october-reports'

const tabs = [
  { id: 'basic', label: 'Basic Info', shortLabel: 'Info' },
  { id: 'wins', label: 'Highlights & Wins', shortLabel: 'Wins' },
  { id: 'sales', label: 'Sales Data', shortLabel: 'Sales' },
  { id: 'competition', label: 'Competition & Industry', shortLabel: 'Competition' },
  { id: 'marketing', label: 'Photos & Events', shortLabel: 'Photos' },
]

export interface ReportData {
  // Basic Info
  directorId: string
  directorName: string
  region: string
  email: string
  month: string
  executiveSummary: string

  // Wins & Highlights
  wins: Array<{ id: string; title: string; description: string }>
  followUps: string

  // Sales Data - Regional Performance
  monthlySales: number
  monthlyGoal: number
  ytdSales: number
  ytdGoal: number
  openOrders: number
  pipeline: number

  // Sales Data - Rep Firms
  repFirms: Array<{
    id: string
    name: string
    monthlySales: number
    ytdSales: number
    percentToGoal: number
    yoyGrowth: number
  }>

  // Competition
  competitors: Array<{
    id: string
    name: string
    whatWereSeeing: string
    ourResponse: string
  }>
  marketTrends: string
  industryInfo: string

  // Key Initiatives
  keyProjects: string
  distributionUpdates: string
  challengesBlockers: string

  // Marketing & Events
  eventsAttended: string
  marketingCampaigns: string
  photos: Array<{ id: string; filename: string; url: string }>

  // Good Jobs (Peer Recognition)
  goodJobs: Array<{ id: string; personName: string; reason: string }>
}

const initialReportData: ReportData = {
  directorId: '',
  directorName: '',
  region: '',
  email: '',
  month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  executiveSummary: '',
  wins: [{ id: '1', title: '', description: '' }],
  followUps: '',
  monthlySales: 0,
  monthlyGoal: 0,
  ytdSales: 0,
  ytdGoal: 0,
  openOrders: 0,
  pipeline: 0,
  repFirms: [{ id: '1', name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0 }],
  competitors: [{ id: '1', name: '', whatWereSeeing: '', ourResponse: '' }],
  marketTrends: '',
  industryInfo: '',
  keyProjects: '',
  distributionUpdates: '',
  challengesBlockers: '',
  eventsAttended: '',
  marketingCampaigns: '',
  photos: [],
  goodJobs: [{ id: '1', personName: '', reason: '' }],
}

interface PreviousReportData {
  exists: boolean
  month: string
  displayMonth: string
  repFirmNames: string[]
  competitorNames: string[]
  goodJobsNames: string[]
}

export default function ReportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [reportData, setReportData] = useState<ReportData>(initialReportData)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)

  // Copy from previous report state
  const [previousReportData, setPreviousReportData] = useState<PreviousReportData | null>(null)
  const [showCopyBanner, setShowCopyBanner] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)

  // Load director info and existing report on mount
  useEffect(() => {
    const directorId = localStorage.getItem('selectedDirectorId')
    if (!directorId) {
      router.push('/')
      return
    }

    loadReportData(directorId)
  }, [router])

  const loadReportData = async (directorId: string) => {
    try {
      // Check for test data mode FIRST - before hitting the database
      const isTestMode = localStorage.getItem('sonance_test_data_active') === 'true'

      // Get director info (from API or test data)
      let director: { id: string; name: string; region: string; email: string } | undefined

      const directorsRes = await fetch('/api/directors')
      if (directorsRes.ok) {
        const directors = await directorsRes.json()
        director = directors.find((d: { id: string }) => d.id === directorId)
      }

      // If API failed and in test mode, get director from config
      if (!director && isTestMode) {
        const { getTestDirectors } = await import('@/lib/test-data/store')
        const testDirectors = getTestDirectors()
        director = testDirectors.find((d: { id: string }) => d.id === directorId)
      }

      if (director) {
        // If test mode is active, load test data directly (skip database)
        if (isTestMode) {
          const testReport = octoberReports.find(r => r.directorName === director!.name)
          if (testReport) {
            setReportData({
              directorId: director.id,
              directorName: director.name,
              region: director.region,
              email: director.email,
              month: testReport.month,
              executiveSummary: testReport.executiveSummary,
              wins: testReport.wins.map((w, i) => ({ id: String(i + 1), ...w })),
              followUps: testReport.followUps,
              monthlySales: testReport.monthlySales,
              monthlyGoal: testReport.monthlyGoal,
              ytdSales: testReport.ytdSales,
              ytdGoal: testReport.ytdGoal,
              openOrders: testReport.openOrders,
              pipeline: testReport.pipeline,
              repFirms: [{ id: '1', name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0 }],
              competitors: testReport.competitors.map((c, i) => ({ id: String(i + 1), ...c })),
              marketTrends: testReport.marketTrends,
              industryInfo: testReport.industryInfo,
              keyProjects: testReport.keyProjects,
              distributionUpdates: '',
              challengesBlockers: '',
              eventsAttended: testReport.eventsAttended,
              marketingCampaigns: testReport.marketingCampaigns,
              photos: [],
              goodJobs: testReport.goodJobs.map((g, i) => ({ id: String(i + 1), ...g })),
            })
            setLoading(false)
            isInitialLoad.current = false
            return // Skip database lookup
          }
        }

        // Normal flow: Check for existing report for current month
        const currentMonth = new Date().toISOString().slice(0, 7)
        const reportRes = await fetch('/api/reports/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ directorId, month: currentMonth })
          })

          if (reportRes.ok) {
            const existingReport = await reportRes.json()
            if (existingReport.exists) {
              // Load existing report data
              setReportData({
                directorId: director.id,
                directorName: director.name,
                region: director.region,
                email: director.email,
                month: existingReport.month,
                executiveSummary: existingReport.executive_summary || '',
                wins: existingReport.wins?.length > 0
                  ? existingReport.wins.map((w: { id: string; title: string; description: string }) => ({
                      id: w.id,
                      title: w.title,
                      description: w.description || ''
                    }))
                  : [{ id: '1', title: '', description: '' }],
                followUps: existingReport.followUps || '',
                monthlySales: existingReport.regionalPerformance?.monthly_sales || 0,
                monthlyGoal: existingReport.regionalPerformance?.monthly_goal || 0,
                ytdSales: existingReport.regionalPerformance?.ytd_sales || 0,
                ytdGoal: existingReport.regionalPerformance?.ytd_goal || 0,
                openOrders: existingReport.regionalPerformance?.open_orders || 0,
                pipeline: existingReport.regionalPerformance?.pipeline || 0,
                repFirms: existingReport.repFirms?.length > 0
                  ? existingReport.repFirms.map((r: { id: string; name: string; monthly_sales: number; ytd_sales: number; percent_to_goal: number; yoy_growth: number }) => ({
                      id: r.id,
                      name: r.name,
                      monthlySales: r.monthly_sales || 0,
                      ytdSales: r.ytd_sales || 0,
                      percentToGoal: r.percent_to_goal || 0,
                      yoyGrowth: r.yoy_growth || 0
                    }))
                  : [{ id: '1', name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0 }],
                competitors: existingReport.competitors?.length > 0
                  ? existingReport.competitors.map((c: { id: string; name: string; what_were_seeing: string; our_response: string }) => ({
                      id: c.id,
                      name: c.name,
                      whatWereSeeing: c.what_were_seeing || '',
                      ourResponse: c.our_response || ''
                    }))
                  : [{ id: '1', name: '', whatWereSeeing: '', ourResponse: '' }],
                marketTrends: existingReport.marketTrends || '',
                industryInfo: existingReport.industryInfo || '',
                keyProjects: existingReport.keyInitiatives?.key_projects || '',
                distributionUpdates: existingReport.keyInitiatives?.distribution_updates || '',
                challengesBlockers: existingReport.keyInitiatives?.challenges_blockers || '',
                eventsAttended: existingReport.marketingEvents?.events_attended || '',
                marketingCampaigns: existingReport.marketingEvents?.marketing_campaigns || '',
                photos: existingReport.photos || [],
                goodJobs: existingReport.goodJobs?.length > 0
                  ? existingReport.goodJobs.map((g: { id: string; person_name: string; reason: string }) => ({
                      id: g.id,
                      personName: g.person_name,
                      reason: g.reason || ''
                    }))
                  : [{ id: '1', personName: '', reason: '' }],
              })
            } else {
              // New report - just set director info
              setReportData(prev => ({
                ...prev,
                directorId: director.id,
                directorName: director.name,
                region: director.region,
                email: director.email,
              }))

              // Check for previous report to offer copy option
              try {
                const prevRes = await fetch('/api/reports/previous', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ directorId, currentMonth })
                })
                if (prevRes.ok) {
                  const prevData = await prevRes.json()
                  if (prevData.exists) {
                    setPreviousReportData(prevData)
                    setShowCopyBanner(true)
                  }
                }
              } catch (err) {
                console.error('Failed to fetch previous report:', err)
              }
            }
          } else {
            // API error, use director info only
            setReportData(prev => ({
              ...prev,
              directorId: director.id,
              directorName: director.name,
              region: director.region,
              email: director.email,
            }))
          }
        }
    } catch (error) {
      console.error('Failed to load report data:', error)
    } finally {
      setLoading(false)
      isInitialLoad.current = false
    }
  }

  // Auto-save to Supabase with debounce
  const saveToSupabase = useCallback(async (data: ReportData) => {
    if (!data.directorId || isInitialLoad.current) return

    try {
      const payload = {
        directorId: data.directorId,
        month: data.month,
        executiveSummary: data.executiveSummary,
        status: 'draft',
        wins: data.wins,
        followUps: data.followUps,
        repFirms: data.repFirms,
        competitors: data.competitors,
        regionalPerformance: {
          monthlySales: data.monthlySales,
          monthlyGoal: data.monthlyGoal,
          ytdSales: data.ytdSales,
          ytdGoal: data.ytdGoal,
          openOrders: data.openOrders,
          pipeline: data.pipeline,
        },
        keyInitiatives: {
          keyProjects: data.keyProjects,
          distributionUpdates: data.distributionUpdates,
          challengesBlockers: data.challengesBlockers,
        },
        marketingEvents: {
          eventsAttended: data.eventsAttended,
          marketingCampaigns: data.marketingCampaigns,
        },
        marketTrends: data.marketTrends,
        industryInfo: data.industryInfo,
        goodJobs: data.goodJobs,
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save')
      return true
    } catch (error) {
      console.error('Failed to save to Supabase:', error)
      return false
    }
  }, [])

  // Debounced save effect
  useEffect(() => {
    if (isInitialLoad.current || loading) return

    setSaveStatus('unsaved')
    const timeoutId = setTimeout(async () => {
      setSaveStatus('saving')
      const success = await saveToSupabase(reportData)
      setSaveStatus(success ? 'saved' : 'error')
    }, 2000) // 2 second debounce for database saves

    return () => clearTimeout(timeoutId)
  }, [reportData, saveToSupabase, loading])

  const updateReportData = (updates: Partial<ReportData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleCopyFromPrevious = (includeGoodJobs: boolean) => {
    if (!previousReportData) return

    const updates: Partial<ReportData> = {}

    // Copy rep firms - names only, numbers reset to 0
    if (previousReportData.repFirmNames.length > 0) {
      updates.repFirms = previousReportData.repFirmNames.map((name, i) => ({
        id: `copied-${Date.now()}-${i}`,
        name,
        monthlySales: 0,
        ytdSales: 0,
        percentToGoal: 0,
        yoyGrowth: 0,
      }))
    }

    // Copy competitors - names only, analysis cleared
    if (previousReportData.competitorNames.length > 0) {
      updates.competitors = previousReportData.competitorNames.map((name, i) => ({
        id: `copied-${Date.now()}-${i}`,
        name,
        whatWereSeeing: '',
        ourResponse: '',
      }))
    }

    // Optionally copy good jobs names (reason cleared)
    if (includeGoodJobs && previousReportData.goodJobsNames.length > 0) {
      updates.goodJobs = previousReportData.goodJobsNames.map((name, i) => ({
        id: `copied-${Date.now()}-${i}`,
        personName: name,
        reason: '',
      }))
    }

    setReportData(prev => ({ ...prev, ...updates }))
    setShowCopyBanner(false)
    setShowCopyModal(false)
  }

  const handleSwitchAccount = () => {
    localStorage.removeItem('selectedDirectorId')
    router.push('/')
  }

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit this report? You can still edit it after submission.')) {
      return
    }

    setSaveStatus('saving')

    try {
      const payload = {
        directorId: reportData.directorId,
        month: reportData.month,
        executiveSummary: reportData.executiveSummary,
        status: 'submitted',
        wins: reportData.wins,
        followUps: reportData.followUps,
        repFirms: reportData.repFirms,
        competitors: reportData.competitors,
        regionalPerformance: {
          monthlySales: reportData.monthlySales,
          monthlyGoal: reportData.monthlyGoal,
          ytdSales: reportData.ytdSales,
          ytdGoal: reportData.ytdGoal,
          openOrders: reportData.openOrders,
          pipeline: reportData.pipeline,
        },
        keyInitiatives: {
          keyProjects: reportData.keyProjects,
          distributionUpdates: reportData.distributionUpdates,
          challengesBlockers: reportData.challengesBlockers,
        },
        marketingEvents: {
          eventsAttended: reportData.eventsAttended,
          marketingCampaigns: reportData.marketingCampaigns,
        },
        marketTrends: reportData.marketTrends,
        industryInfo: reportData.industryInfo,
        goodJobs: reportData.goodJobs,
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to submit')

      alert('Report submitted successfully!')
      router.push('/')
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report. Please try again.')
      setSaveStatus('error')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab data={reportData} updateData={updateReportData} />
      case 'wins':
        return <WinsHighlightsTab data={reportData} updateData={updateReportData} />
      case 'sales':
        return <SalesDataTab data={reportData} updateData={updateReportData} />
      case 'competition':
        return <CompetitionTab data={reportData} updateData={updateReportData} />
      case 'marketing':
        return <MarketingEventsTab data={reportData} updateData={updateReportData} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="bg-card-bg rounded-lg p-8 text-center">
          <p className="text-foreground">Loading your report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-card-bg rounded-t-2xl overflow-hidden">
          {/* Sonance Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>

          <div className="p-6 border-b border-card-border">
            {/* User Info Bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-card-border/50">
              <div className="text-sm text-muted-foreground">
                Signed in as: <span className="font-semibold text-foreground">{reportData.directorName || 'Loading...'}</span>
              </div>
              <button
                onClick={handleSwitchAccount}
                className="text-sm text-sonance-blue hover:underline uppercase tracking-wide"
              >
                Switch Account
              </button>
            </div>

            <div className="text-center">
              <img
                src="/logos/sonance_logo_dark.png"
                alt="Sonance"
                className="h-7 mx-auto mb-4"
              />
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
                Field Team Bi-Weekly Report
              </h1>
              <p className="text-foreground text-sm opacity-70">
                Comprehensive Sales Performance & Market Intelligence
              </p>
            </div>

            {/* Save Status Indicator */}
            <div className="mt-2 text-xs text-center">
              {saveStatus === 'saved' && (
                <span className="text-sonance-green">All changes saved to cloud</span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-sonance-blue">Saving...</span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-foreground opacity-50">Unsaved changes</span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600">Error saving - will retry</span>
              )}
            </div>
          </div>
        </div>

        {/* Copy from Previous Banner */}
        {showCopyBanner && previousReportData && (
          <CopyFromPreviousBanner
            previousMonth={previousReportData.displayMonth}
            onCopy={() => setShowCopyModal(true)}
            onDismiss={() => setShowCopyBanner(false)}
          />
        )}

        {/* Tab Navigation */}
        <div className="bg-card-bg px-4 sm:px-6 pt-4 border-b border-card-border">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-sonance-blue text-white'
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card-bg p-6 min-h-[500px]">
          {renderTabContent()}
        </div>

        {/* Submit Button */}
        <div className="bg-card-bg rounded-b-2xl p-6 border-t border-card-border">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-sonance-blue text-white font-semibold rounded-lg hover:bg-[#0091c8] transition-all shadow-lg uppercase tracking-wide"
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* Copy from Previous Modal */}
      {showCopyModal && previousReportData && (
        <CopyFromPreviousModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          onConfirm={handleCopyFromPrevious}
          previousMonth={previousReportData.displayMonth}
          repFirmNames={previousReportData.repFirmNames}
          competitorNames={previousReportData.competitorNames}
          goodJobsNames={previousReportData.goodJobsNames}
        />
      )}
    </div>
  )
}
