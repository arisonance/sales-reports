'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Tab components
import BasicInfoTab from '@/components/ReportForm/BasicInfoTab'
import WinsHighlightsTab from '@/components/ReportForm/WinsHighlightsTab'
import SalesDataTab from '@/components/ReportForm/SalesDataTab'
import CompetitionTab from '@/components/ReportForm/CompetitionTab'
import KeyInitiativesTab from '@/components/ReportForm/KeyInitiativesTab'
import MarketingEventsTab from '@/components/ReportForm/MarketingEventsTab'

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'wins', label: 'Wins & Highlights' },
  { id: 'sales', label: 'Sales Data' },
  { id: 'competition', label: 'Competition' },
  { id: 'initiatives', label: 'Key Initiatives' },
  { id: 'marketing', label: 'Marketing & Events' },
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
  keyProjects: '',
  distributionUpdates: '',
  challengesBlockers: '',
  eventsAttended: '',
  marketingCampaigns: '',
  photos: [],
  goodJobs: [{ id: '1', personName: '', reason: '' }],
}

export default function ReportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [reportData, setReportData] = useState<ReportData>(initialReportData)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)

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
      // Fetch director info
      const directorsRes = await fetch('/api/directors')
      if (directorsRes.ok) {
        const directors = await directorsRes.json()
        const director = directors.find((d: { id: string }) => d.id === directorId)
        if (director) {
          // Check for existing report for current month
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
      case 'initiatives':
        return <KeyInitiativesTab data={reportData} updateData={updateReportData} />
      case 'marketing':
        return <MarketingEventsTab data={reportData} updateData={updateReportData} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#333F48] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-[#333F48]">Loading your report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#333F48] p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl overflow-hidden">
          {/* Sonance Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>

          <div className="p-6 text-center border-b border-[#D9D9D6]">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-7 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">
              Field Team Bi-Weekly Report
            </h1>
            <p className="text-[#333F48] text-sm opacity-70">
              Comprehensive Sales Performance & Market Intelligence
            </p>

            {/* Save Status Indicator */}
            <div className="mt-2 text-xs">
              {saveStatus === 'saved' && (
                <span className="text-[#00B2A9]">All changes saved to cloud</span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-[#00A3E1]">Saving...</span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-[#333F48] opacity-50">Unsaved changes</span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600">Error saving - will retry</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-6 pt-4 border-b border-[#D9D9D6]">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors uppercase tracking-wide ${
                  activeTab === tab.id
                    ? 'bg-[#00A3E1] text-white'
                    : 'bg-[#D9D9D6]/50 text-[#333F48] hover:bg-[#D9D9D6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 min-h-[500px]">
          {renderTabContent()}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-b-2xl p-6 border-t border-[#D9D9D6]">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-[#00A3E1] text-white font-semibold rounded-lg hover:bg-[#0091c8] transition-all shadow-lg uppercase tracking-wide"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  )
}
