import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get complete setup for a director
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get director info
    const { data: director, error: directorError } = await supabase
      .from('directors')
      .select('*, regions(id, name)')
      .eq('id', id)
      .single()

    if (directorError) {
      if (directorError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Director not found' }, { status: 404 })
      }
      throw directorError
    }

    // Fetch junction tables with graceful degradation (tables may not exist yet)
    let regionAccess: { region_id: string; is_primary: boolean }[] = []
    let repAccess: { rep_firm_id: string }[] = []
    let customerAccess: { customer_id: string }[] = []
    let channelConfig: { channel_type: string }[] = []

    const { data: ra, error: regionError } = await supabase
      .from('director_region_access')
      .select('region_id, is_primary, regions(id, name)')
      .eq('director_id', id)
    if (!regionError && ra) regionAccess = ra

    const { data: rep, error: repError } = await supabase
      .from('director_rep_access')
      .select('rep_firm_id, rep_firms_master(id, name)')
      .eq('director_id', id)
    if (!repError && rep) repAccess = rep

    const { data: ca, error: customerError } = await supabase
      .from('director_customer_access')
      .select('customer_id, customers_master(id, name)')
      .eq('director_id', id)
    if (!customerError && ca) customerAccess = ca

    const { data: cc, error: channelError } = await supabase
      .from('director_channel_config')
      .select('channel_type')
      .eq('director_id', id)
    if (!channelError && cc) channelConfig = cc

    // Find primary region
    const primaryRegion = regionAccess.find(r => r.is_primary)
    const additionalRegions = regionAccess.filter(r => !r.is_primary)

    return NextResponse.json({
      director,
      primary_region_id: primaryRegion?.region_id || director.region_id || null,
      additional_region_ids: additionalRegions.map(r => r.region_id),
      rep_firm_ids: repAccess.map(r => r.rep_firm_id),
      customer_ids: customerAccess.map(c => c.customer_id),
      channel_types: channelConfig.map(c => c.channel_type),
      uses_direct_customers: director.uses_direct_customers || false,
    })
  } catch (error) {
    console.error('Error fetching director setup:', error)
    return NextResponse.json({ error: 'Failed to fetch director setup' }, { status: 500 })
  }
}

// PUT - Save complete setup for a director
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      primary_region_id,
      additional_region_ids = [],
      rep_firm_ids = [],
      customer_ids = [],
      channel_types = [],
      uses_direct_customers = false
    } = body

    // Verify director exists
    const { data: director, error: checkError } = await supabase
      .from('directors')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !director) {
      return NextResponse.json({ error: 'Director not found' }, { status: 404 })
    }

    // Update director's primary region_id and uses_direct_customers
    const { error: updateError } = await supabase
      .from('directors')
      .update({
        region_id: primary_region_id || null,
        uses_direct_customers
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Clear and replace region access
    await supabase
      .from('director_region_access')
      .delete()
      .eq('director_id', id)

    const regionEntries = []
    if (primary_region_id) {
      regionEntries.push({
        director_id: id,
        region_id: primary_region_id,
        is_primary: true
      })
    }
    for (const regionId of additional_region_ids) {
      if (regionId !== primary_region_id) {
        regionEntries.push({
          director_id: id,
          region_id: regionId,
          is_primary: false
        })
      }
    }

    if (regionEntries.length > 0) {
      const { error: regionError } = await supabase
        .from('director_region_access')
        .insert(regionEntries)

      if (regionError) throw regionError
    }

    // Clear and replace rep access
    await supabase
      .from('director_rep_access')
      .delete()
      .eq('director_id', id)

    if (rep_firm_ids.length > 0) {
      const repEntries = rep_firm_ids.map((repId: string) => ({
        director_id: id,
        rep_firm_id: repId
      }))

      const { error: repError } = await supabase
        .from('director_rep_access')
        .insert(repEntries)

      if (repError) throw repError
    }

    // Clear and replace customer access
    await supabase
      .from('director_customer_access')
      .delete()
      .eq('director_id', id)

    if (customer_ids.length > 0) {
      const customerEntries = customer_ids.map((customerId: string) => ({
        director_id: id,
        customer_id: customerId
      }))

      const { error: customerError } = await supabase
        .from('director_customer_access')
        .insert(customerEntries)

      if (customerError) throw customerError
    }

    // Clear and replace channel configuration
    await supabase
      .from('director_channel_config')
      .delete()
      .eq('director_id', id)

    if (channel_types.length > 0) {
      const channelEntries = channel_types.map((channelType: string) => ({
        director_id: id,
        channel_type: channelType
      }))

      const { error: channelError } = await supabase
        .from('director_channel_config')
        .insert(channelEntries)

      if (channelError) throw channelError
    }

    return NextResponse.json({
      success: true,
      message: 'Director setup saved successfully'
    })
  } catch (error) {
    console.error('Error saving director setup:', error)
    return NextResponse.json({ error: 'Failed to save director setup' }, { status: 500 })
  }
}
