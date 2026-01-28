import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ReportData {
  executiveSummary: string
  wins: Array<{ title: string; description: string }>
  repFirms: Array<{ name: string; monthlySales: number; ytdSales: number; percentToGoal: number; yoyGrowth: number }>
  competitors: Array<{ name: string; whatWereSeeing: string; ourResponse: string }>
  regionalPerformance: {
    monthlySales: number
    monthlyGoal: number
    ytdSales: number
    ytdGoal: number
    openOrders: number
    pipeline: number
  }
  keyInitiatives: {
    keyProjects: string
    distributionUpdates: string
    challengesBlockers: string
  }
  marketingEvents: {
    eventsAttended: string
    marketingCampaigns: string
  }
  marketTrends: string
  followUps: string
}

// Detect changes between old and new data
function detectChanges(
  oldData: ReportData,
  newData: ReportData
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  // Executive summary
  if (oldData.executiveSummary !== newData.executiveSummary) {
    changes['executive_summary'] = {
      old: oldData.executiveSummary,
      new: newData.executiveSummary
    }
  }

  // Regional performance fields
  const perfFields = ['monthlySales', 'monthlyGoal', 'ytdSales', 'ytdGoal', 'openOrders', 'pipeline'] as const
  for (const field of perfFields) {
    if (oldData.regionalPerformance?.[field] !== newData.regionalPerformance?.[field]) {
      changes[`regional_performance.${field}`] = {
        old: oldData.regionalPerformance?.[field],
        new: newData.regionalPerformance?.[field]
      }
    }
  }

  // Key initiatives
  const initFields = ['keyProjects', 'distributionUpdates', 'challengesBlockers'] as const
  for (const field of initFields) {
    if (oldData.keyInitiatives?.[field] !== newData.keyInitiatives?.[field]) {
      changes[`key_initiatives.${field}`] = {
        old: oldData.keyInitiatives?.[field],
        new: newData.keyInitiatives?.[field]
      }
    }
  }

  // Marketing events
  if (oldData.marketingEvents?.eventsAttended !== newData.marketingEvents?.eventsAttended) {
    changes['marketing_events.events_attended'] = {
      old: oldData.marketingEvents?.eventsAttended,
      new: newData.marketingEvents?.eventsAttended
    }
  }
  if (oldData.marketingEvents?.marketingCampaigns !== newData.marketingEvents?.marketingCampaigns) {
    changes['marketing_events.marketing_campaigns'] = {
      old: oldData.marketingEvents?.marketingCampaigns,
      new: newData.marketingEvents?.marketingCampaigns
    }
  }

  // Market trends
  if (oldData.marketTrends !== newData.marketTrends) {
    changes['market_trends'] = {
      old: oldData.marketTrends,
      new: newData.marketTrends
    }
  }

  // Follow ups
  if (oldData.followUps !== newData.followUps) {
    changes['follow_ups'] = {
      old: oldData.followUps,
      new: newData.followUps
    }
  }

  // Arrays - simplified comparison (count changes)
  const oldWinsCount = oldData.wins?.filter(w => w.title).length || 0
  const newWinsCount = newData.wins?.filter(w => w.title).length || 0
  if (oldWinsCount !== newWinsCount || JSON.stringify(oldData.wins) !== JSON.stringify(newData.wins)) {
    changes['wins'] = {
      old: `${oldWinsCount} wins`,
      new: `${newWinsCount} wins`
    }
  }

  const oldRepCount = oldData.repFirms?.filter(r => r.name).length || 0
  const newRepCount = newData.repFirms?.filter(r => r.name).length || 0
  if (oldRepCount !== newRepCount || JSON.stringify(oldData.repFirms) !== JSON.stringify(newData.repFirms)) {
    changes['rep_firms'] = {
      old: `${oldRepCount} rep firms`,
      new: `${newRepCount} rep firms`
    }
  }

  const oldCompCount = oldData.competitors?.filter(c => c.name).length || 0
  const newCompCount = newData.competitors?.filter(c => c.name).length || 0
  if (oldCompCount !== newCompCount || JSON.stringify(oldData.competitors) !== JSON.stringify(newData.competitors)) {
    changes['competitors'] = {
      old: `${oldCompCount} competitors`,
      new: `${newCompCount} competitors`
    }
  }

  return changes
}

// GET - Fetch report for editing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the report with all related data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        directors (id, name, region, email)
      `)
      .eq('id', id)
      .single()

    if (reportError) throw reportError
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Fetch all related data in parallel
    const [
      { data: wins },
      { data: repFirms },
      { data: competitors },
      { data: regionalPerformance },
      { data: keyInitiatives },
      { data: marketingEvents },
      { data: marketTrends },
      { data: followUps },
      { data: photos },
      { data: editHistory }
    ] = await Promise.all([
      supabase.from('wins').select('*').eq('report_id', id),
      supabase.from('rep_firms').select('*').eq('report_id', id),
      supabase.from('competitors').select('*').eq('report_id', id),
      supabase.from('regional_performance').select('*').eq('report_id', id).single(),
      supabase.from('key_initiatives').select('*').eq('report_id', id).single(),
      supabase.from('marketing_events').select('*').eq('report_id', id).single(),
      supabase.from('market_trends').select('*').eq('report_id', id).single(),
      supabase.from('follow_ups').select('*').eq('report_id', id).single(),
      supabase.from('photos').select('*').eq('report_id', id),
      supabase.from('report_edit_history').select('*').eq('report_id', id).order('edited_at', { ascending: false })
    ])

    const fullReport = {
      ...report,
      wins: wins || [],
      repFirms: repFirms || [],
      competitors: competitors || [],
      regionalPerformance: regionalPerformance || null,
      keyInitiatives: keyInitiatives || null,
      marketingEvents: marketingEvents || null,
      marketTrends: marketTrends?.observations || '',
      followUps: followUps?.content || '',
      photos: photos || [],
      editHistory: editHistory || []
    }

    return NextResponse.json(fullReport)
  } catch (error) {
    console.error('Error fetching report for admin edit:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}

// PUT - Update report with audit logging
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { executiveSummary, wins, repFirms, competitors,
            regionalPerformance, keyInitiatives, marketingEvents,
            marketTrends, followUps, editReason } = body

    // First, fetch current state for change detection
    const [
      { data: currentReport },
      { data: currentWins },
      { data: currentRepFirms },
      { data: currentCompetitors },
      { data: currentPerf },
      { data: currentInit },
      { data: currentMarketing },
      { data: currentTrends },
      { data: currentFollowUps }
    ] = await Promise.all([
      supabase.from('reports').select('*').eq('id', id).single(),
      supabase.from('wins').select('*').eq('report_id', id),
      supabase.from('rep_firms').select('*').eq('report_id', id),
      supabase.from('competitors').select('*').eq('report_id', id),
      supabase.from('regional_performance').select('*').eq('report_id', id).single(),
      supabase.from('key_initiatives').select('*').eq('report_id', id).single(),
      supabase.from('marketing_events').select('*').eq('report_id', id).single(),
      supabase.from('market_trends').select('*').eq('report_id', id).single(),
      supabase.from('follow_ups').select('*').eq('report_id', id).single()
    ])

    if (!currentReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Build old data structure for comparison
    const oldData: ReportData = {
      executiveSummary: currentReport.executive_summary || '',
      wins: (currentWins || []).map(w => ({ title: w.title, description: w.description })),
      repFirms: (currentRepFirms || []).map(r => ({
        name: r.name,
        monthlySales: r.monthly_sales,
        ytdSales: r.ytd_sales,
        percentToGoal: r.percent_to_goal,
        yoyGrowth: r.yoy_growth
      })),
      competitors: (currentCompetitors || []).map(c => ({
        name: c.name,
        whatWereSeeing: c.what_were_seeing,
        ourResponse: c.our_response
      })),
      regionalPerformance: currentPerf ? {
        monthlySales: currentPerf.monthly_sales,
        monthlyGoal: currentPerf.monthly_goal,
        ytdSales: currentPerf.ytd_sales,
        ytdGoal: currentPerf.ytd_goal,
        openOrders: currentPerf.open_orders,
        pipeline: currentPerf.pipeline
      } : { monthlySales: 0, monthlyGoal: 0, ytdSales: 0, ytdGoal: 0, openOrders: 0, pipeline: 0 },
      keyInitiatives: currentInit ? {
        keyProjects: currentInit.key_projects || '',
        distributionUpdates: currentInit.distribution_updates || '',
        challengesBlockers: currentInit.challenges_blockers || ''
      } : { keyProjects: '', distributionUpdates: '', challengesBlockers: '' },
      marketingEvents: currentMarketing ? {
        eventsAttended: currentMarketing.events_attended || '',
        marketingCampaigns: currentMarketing.marketing_campaigns || ''
      } : { eventsAttended: '', marketingCampaigns: '' },
      marketTrends: currentTrends?.observations || '',
      followUps: currentFollowUps?.content || ''
    }

    // Build new data structure
    const newData: ReportData = {
      executiveSummary: executiveSummary || '',
      wins: wins || [],
      repFirms: repFirms || [],
      competitors: competitors || [],
      regionalPerformance: regionalPerformance || { monthlySales: 0, monthlyGoal: 0, ytdSales: 0, ytdGoal: 0, openOrders: 0, pipeline: 0 },
      keyInitiatives: keyInitiatives || { keyProjects: '', distributionUpdates: '', challengesBlockers: '' },
      marketingEvents: marketingEvents || { eventsAttended: '', marketingCampaigns: '' },
      marketTrends: marketTrends || '',
      followUps: followUps || ''
    }

    // Detect changes
    const changes = detectChanges(oldData, newData)

    // Update main report
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        executive_summary: executiveSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Update related tables (same logic as /api/reports POST)
    // Wins
    if (wins && wins.length > 0) {
      await supabase.from('wins').delete().eq('report_id', id)
      const winsData = wins.filter((w: { title: string }) => w.title).map((w: { title: string; description: string }) => ({
        report_id: id,
        title: w.title,
        description: w.description
      }))
      if (winsData.length > 0) {
        await supabase.from('wins').insert(winsData)
      }
    }

    // Rep Firms
    if (repFirms && repFirms.length > 0) {
      await supabase.from('rep_firms').delete().eq('report_id', id)
      const repFirmsData = repFirms.filter((r: { name: string }) => r.name).map((r: { name: string; monthlySales: number; ytdSales: number; percentToGoal: number; yoyGrowth: number }) => ({
        report_id: id,
        name: r.name,
        monthly_sales: r.monthlySales || 0,
        ytd_sales: r.ytdSales || 0,
        percent_to_goal: r.percentToGoal || 0,
        yoy_growth: r.yoyGrowth || 0
      }))
      if (repFirmsData.length > 0) {
        await supabase.from('rep_firms').insert(repFirmsData)
      }
    }

    // Competitors
    if (competitors && competitors.length > 0) {
      await supabase.from('competitors').delete().eq('report_id', id)
      const competitorsData = competitors.filter((c: { name: string }) => c.name).map((c: { name: string; whatWereSeeing: string; ourResponse: string }) => ({
        report_id: id,
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
        report_id: id,
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
        report_id: id,
        key_projects: keyInitiatives.keyProjects,
        distribution_updates: keyInitiatives.distributionUpdates,
        challenges_blockers: keyInitiatives.challengesBlockers
      }, { onConflict: 'report_id' })
    }

    // Marketing Events (upsert)
    if (marketingEvents) {
      await supabase.from('marketing_events').upsert({
        report_id: id,
        events_attended: marketingEvents.eventsAttended,
        marketing_campaigns: marketingEvents.marketingCampaigns
      }, { onConflict: 'report_id' })
    }

    // Market Trends (upsert)
    if (marketTrends !== undefined) {
      await supabase.from('market_trends').upsert({
        report_id: id,
        observations: marketTrends
      }, { onConflict: 'report_id' })
    }

    // Follow Ups (upsert)
    if (followUps !== undefined) {
      await supabase.from('follow_ups').upsert({
        report_id: id,
        content: followUps
      }, { onConflict: 'report_id' })
    }

    // Record edit history if there were changes
    if (Object.keys(changes).length > 0) {
      await supabase.from('report_edit_history').insert({
        report_id: id,
        edited_by: 'admin',
        changes: changes,
        edit_reason: editReason || null
      })
    }

    return NextResponse.json({ success: true, changesRecorded: Object.keys(changes).length })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}
