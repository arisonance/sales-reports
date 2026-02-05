import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'
    const entityType = searchParams.get('entity_type') // Filter by entity type

    let query = supabase
      .from('rep_firms_master')
      .select('*, regions(id, name)')
      .order('name')

    if (activeOnly) {
      query = query.eq('active', true)
    }

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching rep firms:', error)
    return NextResponse.json({ error: 'Failed to fetch rep firms' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, region_id, entity_type = 'rep_firm' } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Validate entity_type
    const validTypes = ['rep_firm', 'distributor', 'specialty_account']
    if (!validTypes.includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('rep_firms_master')
      .insert({
        name: name.trim(),
        region_id: region_id || null,
        entity_type,
        active: true
      })
      .select('*, regions(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating rep firm:', error)
    return NextResponse.json({ error: 'Failed to create rep firm' }, { status: 500 })
  }
}
