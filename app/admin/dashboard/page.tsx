'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReportSummary {
  id: string
  directorName: string
  region: string
  month: string
  status: 'draft' | 'submitted'
  updatedAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    // Check admin auth
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    fetchReports()
  }, [router, selectedMonth])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedMonth) params.append('month', selectedMonth)

      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch reports')

      const data = await res.json()

      // Transform data to match our interface
      const transformed: ReportSummary[] = data.map((report: {
        id: string
        month: string
        status: 'draft' | 'submitted'
        updated_at: string
        directors: { name: string; region: string }
      }) => ({
        id: report.id,
        directorName: report.directors?.name || 'Unknown',
        region: report.directors?.region || 'Unknown',
        month: report.month,
        status: report.status,
        updatedAt: report.updated_at
      }))

      setReports(transformed)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesRegion = !selectedRegion || report.region === selectedRegion
    const matchesStatus = !selectedStatus || report.status === selectedStatus
    return matchesRegion && matchesStatus
  })

  const regions = [...new Set(reports.map((r) => r.region))].filter(Boolean)

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9D9D6]/30 flex items-center justify-center">
        <p className="text-[#333F48]">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D9D9D6]/30">
      {/* Header */}
      <div className="bg-white shadow">
        {/* Sonance Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-6"
            />
            <h1 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/consolidated"
              className="px-4 py-2 bg-[#00A3E1] text-white rounded-lg hover:bg-[#0091c8] transition-colors text-sm font-semibold uppercase tracking-wide"
            >
              Generate Consolidated Report
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-[#333F48] opacity-60 hover:text-[#00A3E1] hover:opacity-100 transition-all uppercase tracking-wide"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                Filter by Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] text-[#333F48]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                Filter by Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] text-[#333F48]"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] text-[#333F48]"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#00A3E1]">
            <p className="text-sm text-[#333F48] opacity-70 uppercase tracking-wide">Total Reports</p>
            <p className="text-2xl font-bold text-[#333F48]">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#00B2A9]">
            <p className="text-sm text-[#333F48] opacity-70 uppercase tracking-wide">Submitted</p>
            <p className="text-2xl font-bold text-[#00B2A9]">
              {reports.filter(r => r.status === 'submitted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#D9D9D6]">
            <p className="text-sm text-[#333F48] opacity-70 uppercase tracking-wide">Drafts</p>
            <p className="text-2xl font-bold text-[#333F48] opacity-60">
              {reports.filter(r => r.status === 'draft').length}
            </p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D9D9D6]">
            <h2 className="text-lg font-bold text-[#333F48] uppercase tracking-wide">
              All Reports
            </h2>
            <p className="text-sm text-[#333F48] opacity-70">
              View and generate consolidated reports for submission to owners and investors.
            </p>
          </div>

          {filteredReports.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#333F48] opacity-60">
              No reports found for the selected filters.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#D9D9D6]/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Director
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#333F48] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9D6]">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#D9D9D6]/20">
                    <td className="px-6 py-4 text-sm text-[#333F48] font-medium">
                      {report.directorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#333F48] opacity-80">
                      {report.region}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#333F48] opacity-80">
                      {new Date(report.month + '-01').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                          report.status === 'submitted'
                            ? 'bg-[#00B2A9]/20 text-[#00B2A9]'
                            : 'bg-[#D9D9D6]/50 text-[#333F48]'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#333F48] opacity-60">
                      {new Date(report.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/report/${report.id}`}
                        className="text-[#00A3E1] hover:text-[#0091c8] text-sm font-semibold uppercase tracking-wide"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
