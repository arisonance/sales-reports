import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Get previous report data for a director (most recent before current month)
// Returns only names for rep firms, competitors, and good jobs (no numbers or analysis)
export async function POST(request: Request) {
  try {
    const { directorId, currentMonth } = await request.json()

    // Find the most recent report before the current month
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, month')
      .eq('director_id', directorId)
      .lt('month', currentMonth)
      .order('month', { ascending: false })
      .limit(1)
      .single()

    if (reportError && reportError.code !== 'PGRST116') {
      throw reportError
    }

    if (!report) {
      return NextResponse.json({ exists: false })
    }

    // Fetch only the recurring data we want to copy (names only)
    const [
      { data: repFirms },
      { data: competitors },
      { data: goodJobs }
    ] = await Promise.all([
      supabase.from('rep_firms').select('name, entity_type').eq('report_id', report.id),
      supabase.from('competitors').select('name').eq('report_id', report.id),
      supabase.from('good_jobs').select('person_name').eq('report_id', report.id)
    ])

    // Format month for display (e.g., "2024-12" -> "December 2024")
    const [year, monthNum] = report.month.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const displayMonth = `${monthNames[parseInt(monthNum) - 1]} ${year}`

    return NextResponse.json({
      exists: true,
      month: report.month,
      displayMonth,
      repFirmNames: (repFirms || []).filter(r => r.name).map(r => ({ name: r.name, entityType: r.entity_type || 'rep_firm' })),
      competitorNames: (competitors || []).map(c => c.name).filter(Boolean),
      goodJobsNames: (goodJobs || []).map(g => g.person_name).filter(Boolean)
    })
  } catch (error) {
    console.error('Error fetching previous report:', error)
    return NextResponse.json({ error: 'Failed to fetch previous report' }, { status: 500 })
  }
}
