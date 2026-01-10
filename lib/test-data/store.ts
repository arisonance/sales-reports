// Test data store - manages localStorage-based test data for development

import { octoberReports, TestReport } from './october-reports'
import directorsConfig from '@/config/directors.json'

const STORAGE_KEY = 'sonance_test_data_active'
const REPORTS_KEY = 'sonance_test_reports'

// Check if test mode is currently active
export function isTestModeActive(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

// Load test data into localStorage
export function loadTestData(): { success: boolean; count: number } {
  if (typeof window === 'undefined') return { success: false, count: 0 }

  try {
    // Store the reports
    localStorage.setItem(REPORTS_KEY, JSON.stringify(octoberReports))
    localStorage.setItem(STORAGE_KEY, 'true')
    return { success: true, count: octoberReports.length }
  } catch (error) {
    console.error('Failed to load test data:', error)
    return { success: false, count: 0 }
  }
}

// Clear test data from localStorage
export function clearTestData(): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(REPORTS_KEY)
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear test data:', error)
    return false
  }
}

// Get test reports, optionally filtered by month
export function getTestReports(month?: string): TestReport[] {
  if (typeof window === 'undefined') return []
  if (!isTestModeActive()) return []

  try {
    const stored = localStorage.getItem(REPORTS_KEY)
    if (!stored) return []

    const reports: TestReport[] = JSON.parse(stored)
    if (month) {
      return reports.filter(r => r.month === month)
    }
    return reports
  } catch (error) {
    console.error('Failed to get test reports:', error)
    return []
  }
}

// Get test data in the format expected by the consolidated page
export function getTestConsolidatedData(month: string) {
  const reports = getTestReports(month)
  if (reports.length === 0) return null

  // Calculate totals
  const totalMonthlySales = reports.reduce((sum, r) => sum + r.monthlySales, 0)
  const totalMonthlyGoal = reports.reduce((sum, r) => sum + r.monthlyGoal, 0)
  const totalYtdSales = reports.reduce((sum, r) => sum + r.ytdSales, 0)
  const totalYtdGoal = reports.reduce((sum, r) => sum + r.ytdGoal, 0)
  const totalPipeline = reports.reduce((sum, r) => sum + r.pipeline, 0)
  const totalOpenOrders = reports.reduce((sum, r) => sum + r.openOrders, 0)

  // Convert to region format
  const regions = reports.map((r, idx) => ({
    region: r.region,
    director: r.directorName,
    reportId: `test-${idx}`,
    monthlySales: r.monthlySales,
    monthlyGoal: r.monthlyGoal,
    percentToGoal: r.monthlyGoal > 0 ? Math.round((r.monthlySales / r.monthlyGoal) * 100) : 0,
    pipeline: r.pipeline,
    openOrders: r.openOrders,
    topWin: r.wins[0]?.title || '',
    status: 'submitted' as const,
  }))

  // Collect top wins and competitive themes
  const topWins = reports
    .flatMap(r => r.wins.map(w => `${r.directorName}: ${w.title} - ${w.description}`))
    .slice(0, 10)

  const competitiveThemes = reports
    .flatMap(r => r.competitors.map(c => `${c.name}: ${c.whatWereSeeing}`))
    .filter(t => t.length > 3)
    .slice(0, 10)

  const keyInitiatives = reports
    .filter(r => r.keyProjects)
    .map(r => `${r.directorName}: ${r.keyProjects}`)
    .slice(0, 10)

  return {
    month,
    totalDirectors: reports.length,
    submittedReports: reports.length,
    totalReports: reports.length,
    totalMonthlySales,
    totalMonthlyGoal,
    totalYtdSales,
    totalYtdGoal,
    totalPipeline,
    totalOpenOrders,
    reports: reports.map((r, idx) => ({
      id: `test-${idx}`,
      directorName: r.directorName,
      region: r.region,
      status: 'submitted',
    })),
    regions,
    topWins,
    competitiveThemes,
    keyInitiatives,
  }
}

// Get full report data for AI summary generation
export function getTestReportDetails(reportIds: string[]): Array<{
  id: string
  director_name: string
  region: string
  executive_summary: string | null
  wins: { title: string; description: string }[]
  competitors: { name: string; what_were_seeing: string; our_response: string }[]
  market_trends: string | null
  key_projects: string | null
  events_attended: string | null
  good_jobs: { person_name: string; reason: string }[]
  monthly_sales: number
  monthly_goal: number
  pipeline: number
}> {
  const reports = getTestReports()
  if (reports.length === 0) return []

  return reportIds
    .map(id => {
      const idx = parseInt(id.replace('test-', ''))
      const r = reports[idx]
      if (!r) return null

      return {
        id,
        director_name: r.directorName,
        region: r.region,
        executive_summary: r.executiveSummary,
        wins: r.wins,
        competitors: r.competitors.map(c => ({
          name: c.name,
          what_were_seeing: c.whatWereSeeing,
          our_response: c.ourResponse,
        })),
        market_trends: r.marketTrends || null,
        key_projects: r.keyProjects || null,
        events_attended: r.eventsAttended || null,
        good_jobs: r.goodJobs.map(g => ({
          person_name: g.personName,
          reason: g.reason,
        })),
        monthly_sales: r.monthlySales,
        monthly_goal: r.monthlyGoal,
        pipeline: r.pipeline,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
}

// Get directors from config file for test mode (when API is unavailable)
export function getTestDirectors(): Array<{ id: string; name: string; email: string; region: string }> {
  return directorsConfig.directors.map((d, idx) => ({
    id: `director-${idx}`,
    name: d.name,
    email: d.email,
    region: d.region,
  }))
}
