import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Returns channel config + assigned entities grouped by type + assigned customers
// Used by the report form to determine which sections to show and pre-populate entities
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch all data in parallel
    const [channelResult, directorResult, repAccessResult, customerAccessResult] = await Promise.all([
      // 1. Channel types from director_channel_config
      supabase
        .from('director_channel_config')
        .select('channel_type')
        .eq('director_id', id),

      // 2. Director's uses_direct_customers flag
      supabase
        .from('directors')
        .select('uses_direct_customers')
        .eq('id', id)
        .single(),

      // 3. Assigned entities with entity_type from rep_firms_master
      supabase
        .from('director_rep_access')
        .select(`
          rep_firm_id,
          rep_firms_master (
            id,
            name,
            entity_type
          )
        `)
        .eq('director_id', id),

      // 4. Assigned customers from customers_master
      supabase
        .from('director_customer_access')
        .select(`
          customer_id,
          customers_master (
            id,
            name
          )
        `)
        .eq('director_id', id),
    ])

    const channel_types = channelResult.data?.map(c => c.channel_type) || []
    const uses_direct_customers = directorResult.data?.uses_direct_customers || false

    const entities = repAccessResult.data
      ?.map(item => item.rep_firms_master)
      .filter(Boolean) || []

    const customers = customerAccessResult.data
      ?.map(item => item.customers_master)
      .filter(Boolean) || []

    return NextResponse.json({
      channel_types,
      uses_direct_customers,
      entities,
      customers,
    })
  } catch (error) {
    console.error('Error fetching channel config:', error)
    return NextResponse.json({ error: 'Failed to fetch channel config' }, { status: 500 })
  }
}
