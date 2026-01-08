import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET consolidated report data for a given month
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    // Fetch all reports for the month with director info
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        directors (id, name, region, email)
      `)
      .eq('month', month)

    if (reportsError) throw reportsError

    // Get total directors count
    const { count: totalDirectors } = await supabase
      .from('directors')
      .select('*', { count: 'exact', head: true })

    if (!reports || reports.length === 0) {
      return NextResponse.json({
        month,
        totalDirectors: totalDirectors || 0,
        submittedReports: 0,
        totalMonthlySales: 0,
        totalMonthlyGoal: 0,
        totalYtdSales: 0,
        totalYtdGoal: 0,
        totalPipeline: 0,
        totalOpenOrders: 0,
        regions: [],
        topWins: [],
        competitiveThemes: [],
        keyInitiatives: []
      })
    }

    // Fetch all related data for each report
    const reportIds = reports.map(r => r.id)

    const [
      { data: allRegionalPerformance },
      { data: allWins },
      { data: allCompetitors },
      { data: allKeyInitiatives }
    ] = await Promise.all([
      supabase.from('regional_performance').select('*').in('report_id', reportIds),
      supabase.from('wins').select('*').in('report_id', reportIds),
      supabase.from('competitors').select('*').in('report_id', reportIds),
      supabase.from('key_initiatives').select('*').in('report_id', reportIds)
    ])

    // Build performance lookup by report_id
    const perfByReport = new Map()
    allRegionalPerformance?.forEach(p => perfByReport.set(p.report_id, p))

    // Calculate totals
    let totalMonthlySales = 0
    let totalMonthlyGoal = 0
    let totalYtdSales = 0
    let totalYtdGoal = 0
    let totalPipeline = 0
    let totalOpenOrders = 0

    const regions = reports.map(report => {
      const perf = perfByReport.get(report.id) || {}
      const monthlySales = perf.monthly_sales || 0
      const monthlyGoal = perf.monthly_goal || 0
      const pipeline = perf.pipeline || 0
      const openOrders = perf.open_orders || 0

      totalMonthlySales += monthlySales
      totalMonthlyGoal += monthlyGoal
      totalYtdSales += perf.ytd_sales || 0
      totalYtdGoal += perf.ytd_goal || 0
      totalPipeline += pipeline
      totalOpenOrders += openOrders

      // Get top win for this region
      const regionWins = allWins?.filter(w => w.report_id === report.id && w.title) || []
      const topWin = regionWins.length > 0 ? regionWins[0].title : ''

      return {
        region: report.directors?.region || 'Unknown',
        director: report.directors?.name || 'Unknown',
        monthlySales,
        monthlyGoal,
        percentToGoal: monthlyGoal > 0 ? Math.round((monthlySales / monthlyGoal) * 100) : 0,
        pipeline,
        openOrders,
        topWin,
        status: report.status
      }
    })

    // Extract top wins with region context
    const topWins = allWins
      ?.filter(w => w.title)
      .slice(0, 10)
      .map(win => {
        const report = reports.find(r => r.id === win.report_id)
        const region = report?.directors?.region || 'Unknown'
        return `${region}: ${win.title}`
      }) || []

    // Extract competitive themes
    const competitiveThemes = allCompetitors
      ?.filter(c => c.name && c.what_were_seeing)
      .slice(0, 10)
      .map(c => `${c.name} - ${c.what_were_seeing}`) || []

    // Extract key initiatives
    const keyInitiatives: string[] = []
    allKeyInitiatives?.forEach(ki => {
      if (ki.key_projects) keyInitiatives.push(ki.key_projects)
      if (ki.distribution_updates) keyInitiatives.push(ki.distribution_updates)
    })

    return NextResponse.json({
      month,
      totalDirectors: totalDirectors || 0,
      submittedReports: reports.filter(r => r.status === 'submitted').length,
      totalReports: reports.length,
      totalMonthlySales,
      totalMonthlyGoal,
      totalYtdSales,
      totalYtdGoal,
      totalPipeline,
      totalOpenOrders,
      regions,
      topWins: topWins.slice(0, 5),
      competitiveThemes: competitiveThemes.slice(0, 5),
      keyInitiatives: keyInitiatives.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching consolidated report:', error)
    return NextResponse.json({ error: 'Failed to fetch consolidated report' }, { status: 500 })
  }
}
