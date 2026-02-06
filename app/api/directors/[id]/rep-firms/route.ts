import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get rep firms assigned to a specific director
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get rep firms assigned to this director via director_rep_access table
    const { data: repAccess, error } = await supabase
      .from('director_rep_access')
      .select(`
        rep_firm_id,
        rep_firms_master (
          id,
          name,
          region_id,
          entity_type
        )
      `)
      .eq('director_id', id)

    if (error) throw error

    // Extract the rep firm data from the joined result
    const repFirms = repAccess
      ?.map(item => item.rep_firms_master)
      .filter(Boolean) || []

    return NextResponse.json(repFirms)
  } catch (error) {
    console.error('Error fetching director rep firms:', error)
    return NextResponse.json({ error: 'Failed to fetch rep firms' }, { status: 500 })
  }
}
