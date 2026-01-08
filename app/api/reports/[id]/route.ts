import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET a single report with all related data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the report with director info
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
      { data: photos }
    ] = await Promise.all([
      supabase.from('wins').select('*').eq('report_id', id),
      supabase.from('rep_firms').select('*').eq('report_id', id),
      supabase.from('competitors').select('*').eq('report_id', id),
      supabase.from('regional_performance').select('*').eq('report_id', id).single(),
      supabase.from('key_initiatives').select('*').eq('report_id', id).single(),
      supabase.from('marketing_events').select('*').eq('report_id', id).single(),
      supabase.from('market_trends').select('*').eq('report_id', id).single(),
      supabase.from('follow_ups').select('*').eq('report_id', id).single(),
      supabase.from('photos').select('*').eq('report_id', id)
    ])

    // Construct full report response
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
      photos: photos || []
    }

    return NextResponse.json(fullReport)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}

// GET report by director and month
export async function POST(request: Request) {
  try {
    const { directorId, month } = await request.json()

    // Fetch the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        directors (id, name, region, email)
      `)
      .eq('director_id', directorId)
      .eq('month', month)
      .single()

    if (reportError && reportError.code !== 'PGRST116') {
      throw reportError
    }

    if (!report) {
      return NextResponse.json({ exists: false })
    }

    // Fetch all related data
    const [
      { data: wins },
      { data: repFirms },
      { data: competitors },
      { data: regionalPerformance },
      { data: keyInitiatives },
      { data: marketingEvents },
      { data: marketTrends },
      { data: followUps },
      { data: photos }
    ] = await Promise.all([
      supabase.from('wins').select('*').eq('report_id', report.id),
      supabase.from('rep_firms').select('*').eq('report_id', report.id),
      supabase.from('competitors').select('*').eq('report_id', report.id),
      supabase.from('regional_performance').select('*').eq('report_id', report.id).single(),
      supabase.from('key_initiatives').select('*').eq('report_id', report.id).single(),
      supabase.from('marketing_events').select('*').eq('report_id', report.id).single(),
      supabase.from('market_trends').select('*').eq('report_id', report.id).single(),
      supabase.from('follow_ups').select('*').eq('report_id', report.id).single(),
      supabase.from('photos').select('*').eq('report_id', report.id)
    ])

    const fullReport = {
      exists: true,
      ...report,
      wins: wins || [],
      repFirms: repFirms || [],
      competitors: competitors || [],
      regionalPerformance: regionalPerformance || null,
      keyInitiatives: keyInitiatives || null,
      marketingEvents: marketingEvents || null,
      marketTrends: marketTrends?.observations || '',
      followUps: followUps?.content || '',
      photos: photos || []
    }

    return NextResponse.json(fullReport)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
