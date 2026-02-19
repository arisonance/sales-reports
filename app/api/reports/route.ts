import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all reports (for admin dashboard)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const directorId = searchParams.get('director_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('reports')
      .select(`
        *,
        directors (name, region, email)
      `)
      .order('updated_at', { ascending: false })

    if (month) {
      query = query.eq('month', month)
    }
    if (directorId) {
      query = query.eq('director_id', directorId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

// POST create or update a report
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { directorId, month, executiveSummary, status, wins, repFirms, competitors,
            regionalPerformance, keyInitiatives, marketingEvents, marketTrends, industryInfo, followUps, goodJobs } = body

    // Check if report already exists for this director/month
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('director_id', directorId)
      .eq('month', month)
      .single()

    let reportId: string

    if (existingReport) {
      // Update existing report
      reportId = existingReport.id
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          executive_summary: executiveSummary,
          status: status || 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (updateError) throw updateError
    } else {
      // Create new report
      const { data: newReport, error: insertError } = await supabase
        .from('reports')
        .insert({
          director_id: directorId,
          month,
          executive_summary: executiveSummary,
          status: status || 'draft'
        })
        .select()
        .single()

      if (insertError) throw insertError
      reportId = newReport.id
    }

    // Update related tables
    // Wins
    if (wins && wins.length > 0) {
      await supabase.from('wins').delete().eq('report_id', reportId)
      const winsData = wins.filter((w: { title: string }) => w.title).map((w: { title: string; description: string }) => ({
        report_id: reportId,
        title: w.title,
        description: w.description
      }))
      if (winsData.length > 0) {
        await supabase.from('wins').insert(winsData)
      }
    }

    // Rep Firms
    if (repFirms && repFirms.length > 0) {
      await supabase.from('rep_firms').delete().eq('report_id', reportId)
      const repFirmsData = repFirms.filter((r: { name: string }) => r.name).map((r: { name: string; monthlySales: number; ytdSales: number; percentToGoal: number; yoyGrowth: number; entityType?: string }) => ({
        report_id: reportId,
        name: r.name,
        monthly_sales: r.monthlySales || 0,
        ytd_sales: r.ytdSales || 0,
        percent_to_goal: r.percentToGoal || 0,
        yoy_growth: r.yoyGrowth || 0,
        entity_type: r.entityType || 'rep_firm',
      }))
      if (repFirmsData.length > 0) {
        await supabase.from('rep_firms').insert(repFirmsData)
      }
    }

    // Competitors
    if (competitors && competitors.length > 0) {
      await supabase.from('competitors').delete().eq('report_id', reportId)
      const competitorsData = competitors.filter((c: { name: string }) => c.name).map((c: { name: string; whatWereSeeing: string; ourResponse: string }) => ({
        report_id: reportId,
        name: c.name,
        what_were_seeing: c.whatWereSeeing,
        our_response: c.ourResponse
      }))
      if (competitorsData.length > 0) {
        await supabase.from('competitors').insert(competitorsData)
      }
    }

    // Regional Performance (upsert)
    if (regionalPerformance) {
      await supabase.from('regional_performance').upsert({
        report_id: reportId,
        monthly_sales: regionalPerformance.monthlySales || 0,
        monthly_goal: regionalPerformance.monthlyGoal || 0,
        ytd_sales: regionalPerformance.ytdSales || 0,
        ytd_goal: regionalPerformance.ytdGoal || 0,
        open_orders: regionalPerformance.openOrders || 0,
        pipeline: regionalPerformance.pipeline || 0
      }, { onConflict: 'report_id' })
    }

    // Key Initiatives (upsert)
    if (keyInitiatives) {
      await supabase.from('key_initiatives').upsert({
        report_id: reportId,
        key_projects: keyInitiatives.keyProjects,
        distribution_updates: keyInitiatives.distributionUpdates,
        challenges_blockers: keyInitiatives.challengesBlockers
      }, { onConflict: 'report_id' })
    }

    // Marketing Events (upsert)
    if (marketingEvents) {
      await supabase.from('marketing_events').upsert({
        report_id: reportId,
        events_attended: marketingEvents.eventsAttended,
        marketing_campaigns: marketingEvents.marketingCampaigns
      }, { onConflict: 'report_id' })
    }

    // Market Trends + Industry Info (upsert)
    if (marketTrends !== undefined || industryInfo !== undefined) {
      const trendData: Record<string, unknown> = { report_id: reportId }
      if (marketTrends !== undefined) trendData.observations = marketTrends
      if (industryInfo !== undefined) trendData.industry_info = industryInfo
      await supabase.from('market_trends').upsert(trendData, { onConflict: 'report_id' })
    }

    // Follow Ups (upsert)
    if (followUps !== undefined) {
      await supabase.from('follow_ups').upsert({
        report_id: reportId,
        content: followUps
      }, { onConflict: 'report_id' })
    }

    // Good Jobs
    if (goodJobs && goodJobs.length > 0) {
      await supabase.from('good_jobs').delete().eq('report_id', reportId)
      const goodJobsData = goodJobs.filter((g: { personName: string }) => g.personName).map((g: { personName: string; reason: string }) => ({
        report_id: reportId,
        person_name: g.personName,
        reason: g.reason
      }))
      if (goodJobsData.length > 0) {
        await supabase.from('good_jobs').insert(goodJobsData)
      }
    }

    return NextResponse.json({ success: true, reportId })
  } catch (error) {
    console.error('Error saving report:', error)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}
