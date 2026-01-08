'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface ReportData {
  id: string
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
  }>
  competitors: Array<{
    id: string
    name: string
    whatWereSeeing: string
    ourResponse: string
  }>
  marketTrends: string
  keyProjects: string
  distributionUpdates: string
  challengesBlockers: string
  eventsAttended: string
  marketingCampaigns: string
  photos: Array<{ id: string; filename: string; url: string }>
}

export default function ViewReport() {
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check admin auth
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    // Fetch report
    fetchReport()
  }, [router, params.id])

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Report not found')
        } else {
          throw new Error('Failed to fetch report')
        }
        return
      }

      const data = await res.json()

      // Transform the data to match our interface
      setReport({
        id: data.id,
        directorName: data.directors?.name || 'Unknown',
        region: data.directors?.region || 'Unknown',
        email: data.directors?.email || '',
        month: data.month,
        executiveSummary: data.executive_summary || '',
        wins: data.wins || [],
        followUps: data.followUps || '',
        monthlySales: data.regionalPerformance?.monthly_sales || 0,
        monthlyGoal: data.regionalPerformance?.monthly_goal || 0,
        ytdSales: data.regionalPerformance?.ytd_sales || 0,
        ytdGoal: data.regionalPerformance?.ytd_goal || 0,
        openOrders: data.regionalPerformance?.open_orders || 0,
        pipeline: data.regionalPerformance?.pipeline || 0,
        repFirms: (data.repFirms || []).map((r: {
          id: string
          name: string
          monthly_sales: number
          ytd_sales: number
          percent_to_goal: number
          yoy_growth: number
        }) => ({
          id: r.id,
          name: r.name,
          monthlySales: r.monthly_sales || 0,
          ytdSales: r.ytd_sales || 0,
          percentToGoal: r.percent_to_goal || 0,
          yoyGrowth: r.yoy_growth || 0
        })),
        competitors: (data.competitors || []).map((c: {
          id: string
          name: string
          what_were_seeing: string
          our_response: string
        }) => ({
          id: c.id,
          name: c.name,
          whatWereSeeing: c.what_were_seeing || '',
          ourResponse: c.our_response || ''
        })),
        marketTrends: data.marketTrends || '',
        keyProjects: data.keyInitiatives?.key_projects || '',
        distributionUpdates: data.keyInitiatives?.distribution_updates || '',
        challengesBlockers: data.keyInitiatives?.challenges_blockers || '',
        eventsAttended: data.marketingEvents?.events_attended || '',
        marketingCampaigns: data.marketingEvents?.marketing_campaigns || '',
        photos: data.photos || []
      })
    } catch (error) {
      console.error('Failed to fetch report:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9D9D6]/30 flex items-center justify-center">
        <p className="text-[#333F48]">Loading report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#D9D9D6]/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#333F48] mb-4">{error || 'Report not found'}</p>
          <Link href="/admin/dashboard" className="text-[#00A3E1] hover:text-[#0091c8] font-semibold uppercase tracking-wide">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D9D9D6]/30">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-[#333F48] opacity-60 hover:text-[#00A3E1] hover:opacity-100 transition-all uppercase tracking-wide text-sm">
              &larr; Back to Dashboard
            </Link>
          </div>
          <button className="px-4 py-2 bg-[#00A3E1] text-white rounded-lg hover:bg-[#0091c8] transition-colors text-sm font-semibold uppercase tracking-wide">
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>
          <div className="p-6">
            <div className="text-center mb-6">
              <img
                src="/logos/sonance_logo_dark.png"
                alt="Sonance"
                className="h-6 mx-auto mb-4"
              />
              <h1 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">
                Regional Sales Director Monthly Report
              </h1>
              <p className="text-[#00A3E1] font-semibold">{formatMonth(report.month)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#333F48] opacity-60 uppercase tracking-wide text-xs">Director</span>
                <p className="font-semibold text-[#333F48]">{report.directorName}</p>
              </div>
              <div>
                <span className="text-[#333F48] opacity-60 uppercase tracking-wide text-xs">Region</span>
                <p className="font-semibold text-[#333F48]">{report.region}</p>
              </div>
              <div>
                <span className="text-[#333F48] opacity-60 uppercase tracking-wide text-xs">Email</span>
                <p className="font-semibold text-[#333F48]">{report.email}</p>
              </div>
              <div>
                <span className="text-[#333F48] opacity-60 uppercase tracking-wide text-xs">Report Period</span>
                <p className="font-semibold text-[#333F48]">{formatMonth(report.month)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {report.executiveSummary && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Executive Summary</h2>
            <p className="text-[#333F48] whitespace-pre-wrap">{report.executiveSummary}</p>
          </div>
        )}

        {/* Sales Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Regional Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#00A3E1]/10 rounded-lg p-4">
              <p className="text-sm text-[#333F48] opacity-60">Monthly Sales</p>
              <p className="text-xl font-bold text-[#00A3E1]">{formatCurrency(report.monthlySales)}</p>
              <p className="text-xs text-gray-400">Goal: {formatCurrency(report.monthlyGoal)}</p>
            </div>
            <div className="bg-[#00B2A9]/10 rounded-lg p-4">
              <p className="text-sm text-[#333F48] opacity-60">YTD Sales</p>
              <p className="text-xl font-bold text-[#00B2A9]">{formatCurrency(report.ytdSales)}</p>
              <p className="text-xs text-gray-400">Goal: {formatCurrency(report.ytdGoal)}</p>
            </div>
            <div className="bg-[#333F48]/10 rounded-lg p-4">
              <p className="text-sm text-[#333F48] opacity-60">Open Orders</p>
              <p className="text-xl font-bold text-[#333F48]">{formatCurrency(report.openOrders)}</p>
            </div>
            <div className="bg-[#D9D9D6]/40 rounded-lg p-4">
              <p className="text-sm text-[#333F48] opacity-60">Pipeline</p>
              <p className="text-xl font-bold text-[#333F48]">{formatCurrency(report.pipeline)}</p>
            </div>
            <div className="bg-[#D9D9D6]/30 rounded-lg p-4">
              <p className="text-sm text-[#333F48] opacity-60">% to Monthly Goal</p>
              <p className="text-xl font-bold text-[#333F48]">
                {report.monthlyGoal > 0 ? Math.round((report.monthlySales / report.monthlyGoal) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Rep Firms */}
        {report.repFirms.length > 0 && report.repFirms.some(f => f.name) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Rep Firm Performance</h2>
            <div className="space-y-4">
              {report.repFirms.filter(f => f.name).map((firm) => (
                <div key={firm.id} className="bg-[#D9D9D6]/30 rounded-lg p-4">
                  <h3 className="font-medium text-[#333F48]">{firm.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-[#333F48] opacity-60">Monthly:</span> {formatCurrency(firm.monthlySales)}
                    </div>
                    <div>
                      <span className="text-[#333F48] opacity-60">YTD:</span> {formatCurrency(firm.ytdSales)}
                    </div>
                    <div>
                      <span className="text-[#333F48] opacity-60">% to Goal:</span> {firm.percentToGoal}%
                    </div>
                    <div>
                      <span className="text-[#333F48] opacity-60">YoY Growth:</span> {firm.yoyGrowth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wins */}
        {report.wins.length > 0 && report.wins.some(w => w.title) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Wins & Highlights</h2>
            <div className="space-y-4">
              {report.wins.filter(w => w.title).map((win) => (
                <div key={win.id} className="border-l-4 border-[#00B2A9] pl-4">
                  <h3 className="font-medium text-[#333F48]">{win.title}</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1">{win.description}</p>
                </div>
              ))}
            </div>
            {report.followUps && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-[#333F48] mb-2">Follow-ups & Working On</h3>
                <p className="text-[#333F48] opacity-80 text-sm whitespace-pre-wrap">{report.followUps}</p>
              </div>
            )}
          </div>
        )}

        {/* Competition */}
        {(report.competitors.length > 0 && report.competitors.some(c => c.name)) || report.marketTrends ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Competitive Intelligence</h2>
            {report.competitors.filter(c => c.name).length > 0 && (
              <div className="space-y-4">
                {report.competitors.filter(c => c.name).map((comp) => (
                  <div key={comp.id} className="bg-[#00A3E1]/5 border-l-4 border-[#00A3E1] rounded-lg p-4">
                    <h3 className="font-medium text-[#333F48]">{comp.name}</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>
                        <span className="text-[#333F48] opacity-60 font-medium">What We&apos;re Seeing:</span>
                        <p className="text-[#333F48] opacity-80">{comp.whatWereSeeing}</p>
                      </div>
                      <div>
                        <span className="text-[#333F48] opacity-60 font-medium">Our Response:</span>
                        <p className="text-[#333F48] opacity-80">{comp.ourResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {report.marketTrends && (
              <div className={report.competitors.filter(c => c.name).length > 0 ? "mt-6 pt-4 border-t" : ""}>
                <h3 className="font-medium text-[#333F48] mb-2">Market Trends</h3>
                <p className="text-[#333F48] opacity-80 text-sm whitespace-pre-wrap">{report.marketTrends}</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Key Initiatives */}
        {(report.keyProjects || report.distributionUpdates || report.challengesBlockers) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Key Initiatives</h2>
            <div className="space-y-4">
              {report.keyProjects && (
                <div>
                  <h3 className="font-medium text-[#333F48]">Key Projects</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.keyProjects}</p>
                </div>
              )}
              {report.distributionUpdates && (
                <div>
                  <h3 className="font-medium text-[#333F48]">Distribution & Partnership Updates</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.distributionUpdates}</p>
                </div>
              )}
              {report.challengesBlockers && (
                <div>
                  <h3 className="font-medium text-[#333F48]">Challenges & Blockers</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.challengesBlockers}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marketing & Events */}
        {(report.eventsAttended || report.marketingCampaigns) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Marketing & Events</h2>
            <div className="space-y-4">
              {report.eventsAttended && (
                <div>
                  <h3 className="font-medium text-[#333F48]">Events Attended</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.eventsAttended}</p>
                </div>
              )}
              {report.marketingCampaigns && (
                <div>
                  <h3 className="font-medium text-[#333F48]">Marketing Campaigns</h3>
                  <p className="text-[#333F48] opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.marketingCampaigns}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photos */}
        {report.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-[#333F48] mb-4 uppercase tracking-wide">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {report.photos.map((photo) => (
                <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
