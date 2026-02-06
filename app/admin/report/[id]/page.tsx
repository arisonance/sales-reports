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
    entityType: string
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
          entity_type?: string
        }) => ({
          id: r.id,
          name: r.name,
          monthlySales: r.monthly_sales || 0,
          ytdSales: r.ytd_sales || 0,
          percentToGoal: r.percent_to_goal || 0,
          yoyGrowth: r.yoy_growth || 0,
          entityType: r.entity_type || 'rep_firm',
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
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">{error || 'Report not found'}</p>
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
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide text-sm">
              &larr; Back to Dashboard
            </Link>
          </div>
          <Link
              href={`/admin/report/${params.id}/edit`}
              className="px-4 py-2 border-2 border-sonance-blue text-sonance-blue rounded-lg hover:bg-sonance-blue hover:text-white transition-colors text-sm font-semibold uppercase tracking-wide"
            >
              Edit Report
            </Link>
          <button className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors text-sm font-semibold uppercase tracking-wide">
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-card-bg rounded-lg shadow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
          <div className="p-6">
            <div className="text-center mb-6">
              <img
                src="/logos/sonance_logo_dark.png"
                alt="Sonance"
                className="h-6 mx-auto mb-4"
              />
              <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
                Regional Sales Director Monthly Report
              </h1>
              <p className="text-sonance-blue font-semibold">{formatMonth(report.month)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Director</span>
                <p className="font-semibold text-foreground">{report.directorName}</p>
              </div>
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Region</span>
                <p className="font-semibold text-foreground">{report.region}</p>
              </div>
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Email</span>
                <p className="font-semibold text-foreground">{report.email}</p>
              </div>
              <div>
                <span className="text-foreground opacity-60 uppercase tracking-wide text-xs">Report Period</span>
                <p className="font-semibold text-foreground">{formatMonth(report.month)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {report.executiveSummary && (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Executive Summary</h2>
            <p className="text-foreground whitespace-pre-wrap">{report.executiveSummary}</p>
          </div>
        )}

        {/* Sales Performance */}
        <div className="bg-card-bg rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Regional Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-sonance-blue/10 rounded-lg p-4">
              <p className="text-sm text-foreground opacity-60">Monthly Sales</p>
              <p className="text-xl font-bold text-sonance-blue">{formatCurrency(report.monthlySales)}</p>
              <p className="text-xs text-muted-foreground">Goal: {formatCurrency(report.monthlyGoal)}</p>
            </div>
            <div className="bg-sonance-green/10 rounded-lg p-4">
              <p className="text-sm text-foreground opacity-60">YTD Sales</p>
              <p className="text-xl font-bold text-sonance-green">{formatCurrency(report.ytdSales)}</p>
              <p className="text-xs text-muted-foreground">Goal: {formatCurrency(report.ytdGoal)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-foreground opacity-60">Open Orders</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(report.openOrders)}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-foreground opacity-60">Pipeline</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(report.pipeline)}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-foreground opacity-60">% to Monthly Goal</p>
              <p className="text-xl font-bold text-foreground">
                {report.monthlyGoal > 0 ? Math.round((report.monthlySales / report.monthlyGoal) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Entity Performance Sections - grouped by type */}
        {(() => {
          const SECTION_LABELS: Record<string, string> = {
            rep_firm: 'Rep Firm Performance',
            distributor: 'Distributor Performance',
            specialty_account: 'Strategic Account Performance',
            direct_customer: 'Direct Customer Performance',
          }
          const namedFirms = report.repFirms.filter(f => f.name)
          const entityTypes = [...new Set(namedFirms.map(f => f.entityType || 'rep_firm'))]

          if (namedFirms.length === 0) return null

          return entityTypes.map((entityType) => {
            const firms = namedFirms.filter(f => (f.entityType || 'rep_firm') === entityType)
            if (firms.length === 0) return null

            return (
              <div key={entityType} className="bg-card-bg rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">
                  {SECTION_LABELS[entityType] || entityType}
                </h2>
                <div className="space-y-4">
                  {firms.map((firm) => (
                    <div key={firm.id} className="bg-muted/20 rounded-lg p-4">
                      <h3 className="font-medium text-foreground">{firm.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-foreground opacity-60">Monthly:</span> {formatCurrency(firm.monthlySales)}
                        </div>
                        <div>
                          <span className="text-foreground opacity-60">YTD:</span> {formatCurrency(firm.ytdSales)}
                        </div>
                        <div>
                          <span className="text-foreground opacity-60">% to Goal:</span> {firm.percentToGoal}%
                        </div>
                        <div>
                          <span className="text-foreground opacity-60">YoY Growth:</span> {firm.yoyGrowth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        })()}

        {/* Wins */}
        {report.wins.length > 0 && report.wins.some(w => w.title) && (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Wins & Highlights</h2>
            <div className="space-y-4">
              {report.wins.filter(w => w.title).map((win) => (
                <div key={win.id} className="border-l-4 border-sonance-green pl-4">
                  <h3 className="font-medium text-foreground">{win.title}</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1">{win.description}</p>
                </div>
              ))}
            </div>
            {report.followUps && (
              <div className="mt-6 pt-4 border-t border-card-border">
                <h3 className="font-medium text-foreground mb-2">Follow-ups & Working On</h3>
                <p className="text-foreground opacity-80 text-sm whitespace-pre-wrap">{report.followUps}</p>
              </div>
            )}
          </div>
        )}

        {/* Competition */}
        {(report.competitors.length > 0 && report.competitors.some(c => c.name)) || report.marketTrends ? (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Competitive Intelligence</h2>
            {report.competitors.filter(c => c.name).length > 0 && (
              <div className="space-y-4">
                {report.competitors.filter(c => c.name).map((comp) => (
                  <div key={comp.id} className="bg-sonance-blue/5 border-l-4 border-sonance-blue rounded-lg p-4">
                    <h3 className="font-medium text-foreground">{comp.name}</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>
                        <span className="text-foreground opacity-60 font-medium">What We&apos;re Seeing:</span>
                        <p className="text-foreground opacity-80">{comp.whatWereSeeing}</p>
                      </div>
                      <div>
                        <span className="text-foreground opacity-60 font-medium">Our Response:</span>
                        <p className="text-foreground opacity-80">{comp.ourResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {report.marketTrends && (
              <div className={report.competitors.filter(c => c.name).length > 0 ? "mt-6 pt-4 border-t border-card-border" : ""}>
                <h3 className="font-medium text-foreground mb-2">Market Trends</h3>
                <p className="text-foreground opacity-80 text-sm whitespace-pre-wrap">{report.marketTrends}</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Key Initiatives */}
        {(report.keyProjects || report.distributionUpdates || report.challengesBlockers) && (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Key Initiatives</h2>
            <div className="space-y-4">
              {report.keyProjects && (
                <div>
                  <h3 className="font-medium text-foreground">Key Projects</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.keyProjects}</p>
                </div>
              )}
              {report.distributionUpdates && (
                <div>
                  <h3 className="font-medium text-foreground">Distribution & Partnership Updates</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.distributionUpdates}</p>
                </div>
              )}
              {report.challengesBlockers && (
                <div>
                  <h3 className="font-medium text-foreground">Challenges & Blockers</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.challengesBlockers}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marketing & Events */}
        {(report.eventsAttended || report.marketingCampaigns) && (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Marketing & Events</h2>
            <div className="space-y-4">
              {report.eventsAttended && (
                <div>
                  <h3 className="font-medium text-foreground">Events Attended</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.eventsAttended}</p>
                </div>
              )}
              {report.marketingCampaigns && (
                <div>
                  <h3 className="font-medium text-foreground">Marketing Campaigns</h3>
                  <p className="text-foreground opacity-80 text-sm mt-1 whitespace-pre-wrap">{report.marketingCampaigns}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photos */}
        {report.photos.length > 0 && (
          <div className="bg-card-bg rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {report.photos.map((photo) => (
                <div key={photo.id} className="aspect-video bg-muted rounded-lg overflow-hidden">
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
