'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  regions: Array<{
    region: string
    director: string
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

export default function ConsolidatedReport() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check admin auth
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    fetchConsolidatedData()
  }, [router, selectedMonth])

  const fetchConsolidatedData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/consolidated?month=${selectedMonth}`)
      if (!res.ok) throw new Error('Failed to fetch consolidated data')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch consolidated data:', error)
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

  const handleExportPDF = async () => {
    alert('PDF export functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9D9D6]/30 flex items-center justify-center">
        <p className="text-[#333F48]">Loading consolidated data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#D9D9D6]/30 flex items-center justify-center">
        <p className="text-[#333F48]">Failed to load data</p>
      </div>
    )
  }

  const overallPercentToGoal = data.totalMonthlyGoal > 0
    ? Math.round((data.totalMonthlySales / data.totalMonthlyGoal) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#D9D9D6]/30">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-[#333F48] opacity-60 hover:text-[#00A3E1] hover:opacity-100 transition-all uppercase tracking-wide text-sm">
              &larr; Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] text-[#333F48]"
            />
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-[#00A3E1] text-white rounded-lg hover:bg-[#0091c8] transition-all text-sm font-semibold uppercase tracking-wide"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>
          <div className="p-8 text-center">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-8 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-[#333F48] mb-2 uppercase tracking-wide">
              Consolidated Monthly Sales Report
            </h1>
            <p className="text-xl text-[#00A3E1] font-semibold">{formatMonth(selectedMonth)}</p>
            <p className="text-sm text-[#333F48] opacity-60 mt-2">
              {data.submittedReports} of {data.totalDirectors} regional reports submitted
              {data.totalReports > data.submittedReports && (
                <span className="text-[#333F48] opacity-80 ml-2">
                  ({data.totalReports - data.submittedReports} draft{data.totalReports - data.submittedReports > 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
        </div>

        {data.totalReports === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-[#333F48] text-lg">No reports submitted for {formatMonth(selectedMonth)}</p>
            <p className="text-[#333F48] opacity-60 mt-2">Regional directors haven&apos;t submitted their reports yet.</p>
          </div>
        ) : (
          <>
            {/* Executive Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Executive Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#00A3E1] rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Total Monthly Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalMonthlySales)}</p>
                  <p className="text-xs opacity-60">Goal: {formatCurrency(data.totalMonthlyGoal)}</p>
                </div>
                <div className="bg-[#00B2A9] rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">% to Goal</p>
                  <p className="text-2xl font-bold">{overallPercentToGoal}%</p>
                  <p className="text-xs opacity-60">
                    {overallPercentToGoal >= 100 ? 'On track!' : `${100 - overallPercentToGoal}% behind`}
                  </p>
                </div>
                <div className="bg-[#333F48] rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Total Pipeline</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalPipeline)}</p>
                  <p className="text-xs opacity-60">Active opportunities</p>
                </div>
                <div className="bg-[#00A3E1]/80 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-80 uppercase tracking-wide">Open Orders</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalOpenOrders)}</p>
                  <p className="text-xs opacity-60">Pending fulfillment</p>
                </div>
              </div>
            </div>

            {/* Regional Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Regional Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#D9D9D6]/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Region
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Director
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Monthly Sales
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Goal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        % to Goal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Pipeline
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9D9D6]">
                    {data.regions.map((region, idx) => (
                      <tr key={idx} className="hover:bg-[#D9D9D6]/20">
                        <td className="px-4 py-3 font-medium text-[#333F48]">{region.region}</td>
                        <td className="px-4 py-3 text-[#333F48] opacity-80">{region.director}</td>
                        <td className="px-4 py-3 text-right text-[#333F48]">{formatCurrency(region.monthlySales)}</td>
                        <td className="px-4 py-3 text-right text-[#333F48] opacity-60">
                          {formatCurrency(region.monthlyGoal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                              region.percentToGoal >= 100
                                ? 'bg-[#00B2A9]/20 text-[#00B2A9]'
                                : region.percentToGoal >= 90
                                ? 'bg-[#00A3E1]/20 text-[#00A3E1]'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {region.percentToGoal}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[#333F48] opacity-80">
                          {formatCurrency(region.pipeline)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                              region.status === 'submitted'
                                ? 'bg-[#00B2A9]/20 text-[#00B2A9]'
                                : 'bg-[#D9D9D6]/50 text-[#333F48]'
                            }`}
                          >
                            {region.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#D9D9D6]/30 font-medium">
                    <tr>
                      <td className="px-4 py-3 text-[#333F48] font-semibold" colSpan={2}>
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-[#333F48] font-semibold">{formatCurrency(data.totalMonthlySales)}</td>
                      <td className="px-4 py-3 text-right text-[#333F48] opacity-60">
                        {formatCurrency(data.totalMonthlyGoal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#00A3E1]/20 text-[#00A3E1] uppercase">
                          {overallPercentToGoal}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[#333F48] font-semibold">{formatCurrency(data.totalPipeline)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Top Wins */}
            {data.topWins.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Top Wins This Month</h2>
                <div className="space-y-3">
                  {data.topWins.map((win, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#00B2A9] text-xl">&#10003;</span>
                      <p className="text-[#333F48]">{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Landscape */}
            {data.competitiveThemes.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Competitive Landscape</h2>
                <div className="space-y-3">
                  {data.competitiveThemes.map((theme, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#00A3E1] text-xl font-bold">!</span>
                      <p className="text-[#333F48]">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Initiatives */}
            {data.keyInitiatives.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Key Initiatives & Updates</h2>
                <div className="space-y-3">
                  {data.keyInitiatives.map((initiative, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#00A3E1] text-xl">&rarr;</span>
                      <p className="text-[#333F48]">{initiative}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-[#333F48] opacity-50 text-sm py-4">
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
