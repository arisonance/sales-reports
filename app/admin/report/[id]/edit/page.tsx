'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Tab components
import BasicInfoTab from '@/components/ReportForm/BasicInfoTab'
import WinsHighlightsTab from '@/components/ReportForm/WinsHighlightsTab'
import SalesDataTab from '@/components/ReportForm/SalesDataTab'
import CompetitionTab from '@/components/ReportForm/CompetitionTab'
import MarketingEventsTab from '@/components/ReportForm/MarketingEventsTab'
import KeyInitiativesTab from '@/components/ReportForm/KeyInitiativesTab'

const tabs = [
  { id: 'basic', label: 'Basic Info', shortLabel: 'Info' },
  { id: 'wins', label: 'Highlights & Wins', shortLabel: 'Wins' },
  { id: 'sales', label: 'Sales Data', shortLabel: 'Sales' },
  { id: 'competition', label: 'Competition & Industry', shortLabel: 'Competition' },
  { id: 'initiatives', label: 'Key Initiatives', shortLabel: 'Initiatives' },
  { id: 'marketing', label: 'Photos & Events', shortLabel: 'Photos' },
]

export interface ReportData {
  directorId: string
  directorName: string
  region: string
  email: string
  month: string
  executiveSummary: string
  wins: Array<{ id: string; title: string; description: string }>
  followUps: string
  monthlySales: number
  monthlyGoal: number
  ytdSales: number
  ytdGoal: number
  openOrders: number
  pipeline: number
  repFirms: Array<{
    id: string
    name: string
    monthlySales: number
    ytdSales: number
    percentToGoal: number
    yoyGrowth: number
    entityType: string
  }>
  competitors: Array<{
    id: string
    name: string
    whatWereSeeing: string
    ourResponse: string
  }>
  marketTrends: string
  industryInfo: string
  keyProjects: string
  distributionUpdates: string
  challengesBlockers: string
  eventsAttended: string
  marketingCampaigns: string
  photos: Array<{ id: string; filename: string; url: string }>
  goodJobs: Array<{ id: string; personName: string; reason: string }>
}

const initialReportData: ReportData = {
  directorId: '',
  directorName: '',
  region: '',
  email: '',
  month: '',
  executiveSummary: '',
  wins: [{ id: '1', title: '', description: '' }],
  followUps: '',
  monthlySales: 0,
  monthlyGoal: 0,
  ytdSales: 0,
  ytdGoal: 0,
  openOrders: 0,
  pipeline: 0,
  repFirms: [{ id: '1', name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' }],
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

interface EditHistory {
  id: string
  edited_at: string
  edited_by: string
  changes: Record<string, { old: unknown; new: unknown }>
  edit_reason: string | null
}

export default function AdminEditReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [reportData, setReportData] = useState<ReportData>(initialReportData)
  const [editReason, setEditReason] = useState('')
  const [editHistory, setEditHistory] = useState<EditHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSalesChannels, setHasSalesChannels] = useState(true)

  const visibleTabs = useMemo(() =>
    tabs.filter(tab => tab.id !== 'sales' || hasSalesChannels),
    [hasSalesChannels]
  )

  useEffect(() => {
    // Check admin auth
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    loadReportData()
  }, [router, id])

  const loadReportData = async () => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Report not found')
        } else {
          throw new Error('Failed to fetch report')
        }
        return
      }

      const data = await res.json()

      setReportData({
        directorId: data.directors?.id || '',
        directorName: data.directors?.name || 'Unknown',
        region: data.directors?.region || 'Unknown',
        email: data.directors?.email || '',
        month: data.month,
        executiveSummary: data.executive_summary || '',
        wins: data.wins?.length > 0
          ? data.wins.map((w: { id: string; title: string; description: string }) => ({
              id: w.id,
              title: w.title,
              description: w.description || ''
            }))
          : [{ id: '1', title: '', description: '' }],
        followUps: data.followUps || '',
        monthlySales: data.regionalPerformance?.monthly_sales || 0,
        monthlyGoal: data.regionalPerformance?.monthly_goal || 0,
        ytdSales: data.regionalPerformance?.ytd_sales || 0,
        ytdGoal: data.regionalPerformance?.ytd_goal || 0,
        openOrders: data.regionalPerformance?.open_orders || 0,
        pipeline: data.regionalPerformance?.pipeline || 0,
        repFirms: data.repFirms?.length > 0
          ? data.repFirms.map((r: { id: string; name: string; monthly_sales: number; ytd_sales: number; percent_to_goal: number; yoy_growth: number; entity_type?: string }) => ({
              id: r.id,
              name: r.name,
              monthlySales: r.monthly_sales || 0,
              ytdSales: r.ytd_sales || 0,
              percentToGoal: r.percent_to_goal || 0,
              yoyGrowth: r.yoy_growth || 0,
              entityType: r.entity_type || 'rep_firm',
            }))
          : [{ id: '1', name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' }],
        competitors: data.competitors?.length > 0
          ? data.competitors.map((c: { id: string; name: string; what_were_seeing: string; our_response: string }) => ({
              id: c.id,
              name: c.name,
              whatWereSeeing: c.what_were_seeing || '',
              ourResponse: c.our_response || ''
            }))
          : [{ id: '1', name: '', whatWereSeeing: '', ourResponse: '' }],
        marketTrends: data.marketTrends || '',
        industryInfo: data.industryInfo || '',
        keyProjects: data.keyInitiatives?.key_projects || '',
        distributionUpdates: data.keyInitiatives?.distribution_updates || '',
        challengesBlockers: data.keyInitiatives?.challenges_blockers || '',
        eventsAttended: data.marketingEvents?.events_attended || '',
        marketingCampaigns: data.marketingEvents?.marketing_campaigns || '',
        photos: data.photos || [],
        goodJobs: data.goodJobs?.length > 0
          ? data.goodJobs.map((g: { id: string; person_name: string; reason: string }) => ({
              id: g.id,
              personName: g.person_name,
              reason: g.reason || ''
            }))
          : [{ id: '1', personName: '', reason: '' }],
      })

      setEditHistory(data.editHistory || [])

      // Fetch channel config to determine if Sales Data tab should be visible
      const directorId = data.directors?.id
      if (directorId) {
        try {
          const channelRes = await fetch(`/api/directors/${directorId}/channel-config`)
          if (channelRes.ok) {
            const config = await channelRes.json()
            setHasSalesChannels(config.channel_types?.length > 0 || config.uses_direct_customers)
          }
        } catch (err) {
          console.error('Failed to fetch channel config:', err)
        }
      }
    } catch (err) {
      console.error('Failed to load report:', err)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const updateReportData = (updates: Partial<ReportData>) => {
    setReportData(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const payload = {
        executiveSummary: reportData.executiveSummary,
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
        editReason: editReason || null,
      }

      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save')

      const result = await res.json()
      alert(`Report updated successfully! ${result.changesRecorded} change(s) recorded.`)
      router.push(`/admin/report/${id}`)
    } catch (err) {
      console.error('Failed to save report:', err)
      alert('Failed to save report. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
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
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">{error}</p>
          <Link href="/admin/dashboard" className="text-sonance-blue hover:text-sonance-blue/80 font-semibold uppercase tracking-wide">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <div className="bg-card-bg shadow">
        <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={`/admin/report/${id}`} className="text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide text-sm">
            &larr; Cancel
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors ${
                saving
                  ? 'bg-muted text-foreground/50 cursor-not-allowed'
                  : 'bg-sonance-green text-white hover:bg-sonance-green/90'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Edit Mode Banner */}
      <div className="bg-amber-500/20 border-b border-amber-500/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-amber-800 dark:text-amber-200 font-medium text-sm">
            ADMIN EDIT MODE — Changes will be tracked in the audit history
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Report Header Info */}
        <div className="bg-card-bg rounded-lg shadow overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
          <div className="p-6">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
                Editing Report
              </h1>
              <p className="text-sonance-blue font-semibold">{formatMonth(reportData.month)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Director</span>
                <p className="font-semibold text-foreground">{reportData.directorName}</p>
              </div>
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Region</span>
                <p className="font-semibold text-foreground">{reportData.region}</p>
              </div>
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Email</span>
                <p className="font-semibold text-foreground">{reportData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Reason */}
        <div className="bg-card-bg rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
            Edit Reason (Optional)
          </label>
          <input
            type="text"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="Why are you making this edit? (e.g., Correcting sales figures, fixing typo)"
            className="w-full px-4 py-2 border-2 border-card-border rounded-lg focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue text-foreground bg-input-bg"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-card-bg rounded-t-lg px-4 pt-4 border-b border-card-border">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {visibleTabs.map((tab) => (
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

        {/* Save Button */}
        <div className="bg-card-bg rounded-b-lg p-6 border-t border-card-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 font-semibold rounded-lg transition-all shadow-lg uppercase tracking-wide ${
              saving
                ? 'bg-muted text-foreground/50 cursor-not-allowed'
                : 'bg-sonance-green text-white hover:bg-sonance-green/90'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Edit History */}
        {editHistory.length > 0 && (
          <div className="bg-card-bg rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Edit History</h2>
            <div className="space-y-3">
              {editHistory.map((entry) => (
                <div key={entry.id} className="bg-muted/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Edited by {entry.edited_by}
                    </span>
                    <span className="text-xs text-foreground opacity-60">
                      {new Date(entry.edited_at).toLocaleString()}
                    </span>
                  </div>
                  {entry.edit_reason && (
                    <p className="text-sm text-foreground opacity-80 mb-2">
                      Reason: {entry.edit_reason}
                    </p>
                  )}
                  <div className="text-xs text-foreground opacity-60">
                    Changed: {Object.keys(entry.changes).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
