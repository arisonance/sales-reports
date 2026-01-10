import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch a saved summary for a period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodType = searchParams.get('periodType')
    const periodValue = searchParams.get('periodValue')

    if (!periodType || !periodValue) {
      return NextResponse.json(
        { error: 'Missing periodType or periodValue' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('global_summaries')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_value', periodValue)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error('Error fetching global summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}

// POST - Save or update a summary for a period
export async function POST(request: NextRequest) {
  try {
    const { periodType, periodValue, summaryText, reportIds } = await request.json()

    if (!periodType || !periodValue || !summaryText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upsert - insert or update if exists
    const { data, error } = await supabase
      .from('global_summaries')
      .upsert(
        {
          period_type: periodType,
          period_value: periodValue,
          summary_text: summaryText,
          report_ids: reportIds || [],
          edited_at: new Date().toISOString()
        },
        {
          onConflict: 'period_type,period_value'
        }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error saving global summary:', error)
    return NextResponse.json(
      { error: 'Failed to save summary' },
      { status: 500 }
    )
  }
}
