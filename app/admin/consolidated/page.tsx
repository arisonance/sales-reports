'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { pdf } from '@react-pdf/renderer'
import { isTestModeActive, getTestConsolidatedData } from '@/lib/test-data/store'

interface ReportInfo {
  id: string
  directorName: string
  region: string
  status: string
}

interface ConsolidatedData {
  month: string
  totalDirectors: number
  submittedReports: number
  totalReports: number
  totalMonthlySales: number
  totalMonthlyGoal: number
  totalYtdSales: number
  totalYtdGoal: number
  totalPipeline: number
  totalOpenOrders: number
  reports: ReportInfo[]
  regions: Array<{
    region: string
    director: string
    reportId: string
    monthlySales: number
    monthlyGoal: number
    percentToGoal: number
    pipeline: number
    openOrders: number
    topWin: string
    status: string
  }>
  topWins: string[]
  competitiveThemes: string[]
  keyInitiatives: string[]
}

interface SavedSummary {
  id: string
  period_type: string
  period_value: string
  summary_text: string
  report_ids: string[]
  generated_at: string
  edited_at: string | null
}

export default function ConsolidatedReport() {
  const router = useRouter()
  const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    return `${now.getFullYear()}-Q${quarter}`
  })
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [testModeActive, setTestModeActive] = useState(false)

  // Report selection
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())

  // AI Summary state
  const [summaryText, setSummaryText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const periodValue = periodType === 'month' ? selectedMonth : selectedQuarter

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    fetchConsolidatedData()
    fetchSavedSummary()
  }, [router, selectedMonth, selectedQuarter, periodType])

  const fetchConsolidatedData = async () => {
    try {
      setLoading(true)

      // Check if test mode is active
      const isTestMode = isTestModeActive()
      setTestModeActive(isTestMode)

      if (periodType === 'month') {
        const res = await fetch(`/api/consolidated?month=${selectedMonth}`)
        if (!res.ok) throw new Error('Failed to fetch consolidated data')
        let consolidatedData = await res.json()

        // If test mode is active and looking at October 2024, merge test data
        if (isTestMode && selectedMonth === '2024-10') {
          const testData = getTestConsolidatedData('2024-10')
          if (testData) {
            // Use test data as primary (replace real data for October 2024)
            consolidatedData = testData
          }
        }

        setData(consolidatedData)

        // Auto-select all submitted reports
        const submittedIds = consolidatedData.regions
          ?.filter((r: { status: string; reportId: string }) => r.status === 'submitted' && r.reportId)
          .map((r: { reportId: string }) => r.reportId) || []
        setSelectedReports(new Set(submittedIds))
      } else {
        // Quarter - fetch 3 months
        const [year, q] = selectedQuarter.split('-Q')
        const quarterNum = parseInt(q)
        const startMonth = (quarterNum - 1) * 3 + 1
        const months = [
          `${year}-${String(startMonth).padStart(2, '0')}`,
          `${year}-${String(startMonth + 1).padStart(2, '0')}`,
          `${year}-${String(startMonth + 2).padStart(2, '0')}`
        ]

        // Fetch all 3 months and combine
        const responses = await Promise.all(
          months.map(m => fetch(`/api/consolidated?month=${m}`).then(r => r.json()))
        )

        // Combine the data
        const combinedData: ConsolidatedData = {
          month: selectedQuarter,
          totalDirectors: responses[0]?.totalDirectors || 0,
          submittedReports: responses.reduce((sum, r) => sum + (r.submittedReports || 0), 0),
          totalReports: responses.reduce((sum, r) => sum + (r.totalReports || 0), 0),
          totalMonthlySales: responses.reduce((sum, r) => sum + (r.totalMonthlySales || 0), 0),
          totalMonthlyGoal: responses.reduce((sum, r) => sum + (r.totalMonthlyGoal || 0), 0),
          totalYtdSales: responses[responses.length - 1]?.totalYtdSales || 0,
          totalYtdGoal: responses[responses.length - 1]?.totalYtdGoal || 0,
          totalPipeline: responses.reduce((sum, r) => sum + (r.totalPipeline || 0), 0),
          totalOpenOrders: responses.reduce((sum, r) => sum + (r.totalOpenOrders || 0), 0),
          reports: [],
          regions: responses.flatMap(r => r.regions || []),
          topWins: responses.flatMap(r => r.topWins || []).slice(0, 10),
          competitiveThemes: responses.flatMap(r => r.competitiveThemes || []).slice(0, 10),
          keyInitiatives: responses.flatMap(r => r.keyInitiatives || []).slice(0, 10)
        }

        setData(combinedData)

        // Auto-select all submitted reports
        const submittedIds = combinedData.regions
          .filter(r => r.status === 'submitted' && r.reportId)
          .map(r => r.reportId)
        setSelectedReports(new Set(submittedIds))
      }
    } catch (error) {
      console.error('Failed to fetch consolidated data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedSummary = async () => {
    try {
      const res = await fetch(`/api/global-summaries?periodType=${periodType}&periodValue=${periodValue}`)
      if (res.ok) {
        const saved: SavedSummary | null = await res.json()
        if (saved) {
          setSummaryText(saved.summary_text)
          setSaveStatus('saved')
        } else {
          setSummaryText('')
          setSaveStatus(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved summary:', error)
    }
  }

  const handleGenerateSummary = async () => {
    if (selectedReports.size === 0) {
      setGenerateError('Please select at least one report')
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch('/api/generate-global-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportIds: Array.from(selectedReports),
          periodType,
          periodValue
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to generate summary')
      }

      setSummaryText(result.summary)
      setSaveStatus('unsaved')
    } catch (error) {
      console.error('Error generating summary:', error)
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate summary')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveSummary = async () => {
    if (!summaryText.trim()) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const res = await fetch('/api/global-summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodType,
          periodValue,
          summaryText,
          reportIds: Array.from(selectedReports)
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save summary:', error)
      setSaveStatus('unsaved')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSummaryChange = (value: string) => {
    setSummaryText(value)
    setSaveStatus('unsaved')
  }

  const toggleReportSelection = (reportId: string) => {
    const newSelected = new Set(selectedReports)
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId)
    } else {
      newSelected.add(reportId)
    }
    setSelectedReports(newSelected)
  }

  const toggleSelectAll = () => {
    const submittedIds = data?.regions
      .filter(r => r.status === 'submitted' && r.reportId)
      .map(r => r.reportId) || []

    if (selectedReports.size === submittedIds.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(submittedIds))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPeriod = () => {
    if (periodType === 'quarter') {
      const [year, q] = selectedQuarter.split('-')
      return `${q} ${year}`
    }
    return new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  const handleExportPDF = async () => {
    if (!data || !summaryText.trim()) {
      alert('Please generate a summary before exporting to PDF')
      return
    }

    try {
      // Dynamically import the PDF component
      const { GlobalSummaryPDF } = await import('@/lib/pdf/global-summary')

      // Generate PDF blob
      const blob = await pdf(
        <GlobalSummaryPDF
          periodType={periodType}
          periodValue={periodValue}
          summaryText={summaryText}
          data={{
            totalMonthlySales: data.totalMonthlySales,
            totalMonthlyGoal: data.totalMonthlyGoal,
            totalYtdSales: data.totalYtdSales,
            totalYtdGoal: data.totalYtdGoal,
            totalPipeline: data.totalPipeline,
            totalOpenOrders: data.totalOpenOrders,
            submittedReports: data.submittedReports,
            totalDirectors: data.totalDirectors,
            regions: data.regions,
            topWins: data.topWins,
            competitiveThemes: data.competitiveThemes,
          }}
        />
      ).toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sonance-${periodType === 'quarter' ? 'quarterly' : 'monthly'}-summary-${periodValue}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  // Generate quarter options
  const getQuarterOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let q = 4; q >= 1; q--) {
        options.push(`${year}-Q${q}`)
      }
    }
    return options
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading consolidated data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Failed to load data</p>
      </div>
    )
  }

  const overallPercentToGoal = data.totalMonthlyGoal > 0
    ? Math.round((data.totalMonthlySales / data.totalMonthlyGoal) * 100)
    : 0

  const submittedReportIds = data.regions
    .filter(r => r.status === 'submitted' && r.reportId)
    .map(r => r.reportId)

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <div className="bg-card-bg shadow">
        <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
        {testModeActive && (
          <div className="bg-sonance-green/10 border-b border-sonance-green/30 px-4 py-2 flex items-center justify-center gap-2 text-sm text-sonance-green">
            <span className="w-2 h-2 bg-sonance-green rounded-full animate-pulse"></span>
            Test Data Mode - Showing October 2024 sample reports
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide text-sm">
              &larr; Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Period Type Toggle */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setPeriodType('month')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  periodType === 'month'
                    ? 'bg-card-bg text-sonance-blue font-semibold shadow'
                    : 'text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriodType('quarter')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  periodType === 'quarter'
                    ? 'bg-card-bg text-sonance-blue font-semibold shadow'
                    : 'text-foreground'
                }`}
              >
                Quarterly
              </button>
            </div>

            {/* Period Selector */}
            {periodType === 'month' ? (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border-2 border-card-border rounded-lg focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue text-foreground bg-input-bg"
              />
            ) : (
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-4 py-2 border-2 border-card-border rounded-lg focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue text-foreground bg-input-bg"
              >
                {getQuarterOptions().map(q => (
                  <option key={q} value={q}>{q.replace('-', ' ')}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-all text-sm font-semibold uppercase tracking-wide"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="bg-card-bg rounded-lg shadow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
          <div className="p-8 text-center">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-8 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
              {periodType === 'quarter' ? 'Quarterly' : 'Monthly'} Sales Summary
            </h1>
            <p className="text-xl text-sonance-blue font-semibold">{formatPeriod()}</p>
            <p className="text-sm text-foreground opacity-60 mt-2">
              {data.submittedReports} of {data.totalDirectors} regional reports submitted
            </p>
          </div>
        </div>

        {data.totalReports === 0 ? (
          <div className="bg-card-bg rounded-lg shadow p-12 text-center">
            <p className="text-foreground text-lg">No reports submitted for {formatPeriod()}</p>
            <p className="text-foreground opacity-60 mt-2">Regional directors haven&apos;t submitted their reports yet.</p>
          </div>
        ) : (
          <>
            {/* Report Selection */}
            <div className="bg-card-bg rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Select Reports for Summary</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-foreground opacity-60">
                    {selectedReports.size} of {submittedReportIds.length} selected
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-sonance-blue hover:underline"
                  >
                    {selectedReports.size === submittedReportIds.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.regions.map((region, idx) => {
                  const isSubmitted = region.status === 'submitted'
                  const isSelected = Boolean(region.reportId && selectedReports.has(region.reportId))

                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        !isSubmitted
                          ? 'border-card-border bg-muted/20 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-sonance-blue bg-sonance-blue/10'
                          : 'border-card-border hover:border-sonance-blue/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSubmitted}
                        onChange={() => region.reportId && toggleReportSelection(region.reportId)}
                        className="w-4 h-4 text-sonance-blue rounded border-card-border focus:ring-sonance-blue"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{region.director}</p>
                        <p className="text-xs text-foreground opacity-60">{region.region}</p>
                      </div>
                      {!isSubmitted && (
                        <span className="ml-auto text-xs text-foreground opacity-50">Draft</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="bg-card-bg rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">AI-Generated Summary</h2>
                <div className="flex items-center gap-3">
                  {saveStatus && (
                    <span className={`text-xs ${
                      saveStatus === 'saved' ? 'text-sonance-green' :
                      saveStatus === 'saving' ? 'text-sonance-blue' :
                      'text-foreground opacity-50'
                    }`}>
                      {saveStatus === 'saved' ? 'Saved' :
                       saveStatus === 'saving' ? 'Saving...' :
                       'Unsaved changes'}
                    </span>
                  )}
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || selectedReports.size === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      isGenerating || selectedReports.size === 0
                        ? 'bg-muted text-foreground/50 cursor-not-allowed'
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
                        {summaryText ? 'Regenerate Summary' : 'Generate Global Summary'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {generateError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {generateError}
                </div>
              )}

              {summaryText ? (
                <div className="space-y-4">
                  <textarea
                    value={summaryText}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none font-mono text-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSummary}
                      disabled={isSaving || saveStatus === 'saved'}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isSaving || saveStatus === 'saved'
                          ? 'bg-muted text-foreground/50 cursor-not-allowed'
                          : 'bg-sonance-green text-white hover:bg-sonance-green/90'
                      }`}
                    >
                      {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Summary'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-foreground opacity-50">
                  <p>Select reports above and click &quot;Generate Global Summary&quot; to create an AI-powered executive summary.</p>
                </div>
              )}
            </div>

            {/* Executive Summary Stats */}
            <div className="bg-card-bg rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Performance Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sonance-blue rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Total {periodType === 'quarter' ? 'Quarterly' : 'Monthly'} Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalMonthlySales)}</p>
                  <p className="text-xs opacity-60">Goal: {formatCurrency(data.totalMonthlyGoal)}</p>
                </div>
                <div className="bg-sonance-green rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">% to Goal</p>
                  <p className="text-2xl font-bold">{overallPercentToGoal}%</p>
                  <p className="text-xs opacity-60">
                    {overallPercentToGoal >= 100 ? 'On track!' : `${100 - overallPercentToGoal}% behind`}
                  </p>
                </div>
                <div className="bg-sonance-charcoal rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Total Pipeline</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalPipeline)}</p>
                  <p className="text-xs opacity-60">Active opportunities</p>
                </div>
                <div className="bg-sonance-blue/80 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Open Orders</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalOpenOrders)}</p>
                  <p className="text-xs opacity-60">Pending fulfillment</p>
                </div>
              </div>
            </div>

            {/* Regional Breakdown */}
            <div className="bg-card-bg rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Regional Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                        Region
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                        Director
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wide">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wide">
                        Goal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wide">
                        % to Goal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wide">
                        Pipeline
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {data.regions.map((region, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{region.region}</td>
                        <td className="px-4 py-3 text-foreground opacity-80">{region.director}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(region.monthlySales)}</td>
                        <td className="px-4 py-3 text-right text-foreground opacity-60">
                          {formatCurrency(region.monthlyGoal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                              region.percentToGoal >= 100
                                ? 'bg-sonance-green/20 text-sonance-green'
                                : region.percentToGoal >= 90
                                ? 'bg-sonance-blue/20 text-sonance-blue'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {region.percentToGoal}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground opacity-80">
                          {formatCurrency(region.pipeline)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                              region.status === 'submitted'
                                ? 'bg-sonance-green/20 text-sonance-green'
                                : 'bg-muted/50 text-foreground'
                            }`}
                          >
                            {region.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Wins */}
            {data.topWins.length > 0 && (
              <div className="bg-card-bg rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Top Wins</h2>
                <div className="space-y-3">
                  {data.topWins.map((win, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-sonance-green text-xl">&#10003;</span>
                      <p className="text-foreground">{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Landscape */}
            {data.competitiveThemes.length > 0 && (
              <div className="bg-card-bg rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Competitive Landscape</h2>
                <div className="space-y-3">
                  {data.competitiveThemes.map((theme, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-sonance-blue text-xl font-bold">!</span>
                      <p className="text-foreground">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-foreground opacity-50 text-sm py-4">
          Report generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  )
}
