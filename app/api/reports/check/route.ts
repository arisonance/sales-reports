import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST check if report exists for director/month and return data if it does
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
      { data: photos },
      { data: goodJobs }
    ] = await Promise.all([
      supabase.from('wins').select('*').eq('report_id', report.id),
      supabase.from('rep_firms').select('*').eq('report_id', report.id),
      supabase.from('competitors').select('*').eq('report_id', report.id),
      supabase.from('regional_performance').select('*').eq('report_id', report.id).single(),
      supabase.from('key_initiatives').select('*').eq('report_id', report.id).single(),
      supabase.from('marketing_events').select('*').eq('report_id', report.id).single(),
      supabase.from('market_trends').select('*').eq('report_id', report.id).single(),
      supabase.from('follow_ups').select('*').eq('report_id', report.id).single(),
      supabase.from('photos').select('*').eq('report_id', report.id),
      supabase.from('good_jobs').select('*').eq('report_id', report.id)
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
      photos: photos || [],
      goodJobs: goodJobs || []
    }

    return NextResponse.json(fullReport)
  } catch (error) {
    console.error('Error checking report:', error)
    return NextResponse.json({ error: 'Failed to check report' }, { status: 500 })
  }
}
