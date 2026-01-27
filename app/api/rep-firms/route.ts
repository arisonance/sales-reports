import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'

    let query = supabase
      .from('rep_firms_master')
      .select('*, regions(id, name)')
      .order('name')

    if (activeOnly) {
      query = query.eq('active', true)
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
    const { name, region_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('rep_firms_master')
      .insert({
        name: name.trim(),
        region_id: region_id || null,
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
