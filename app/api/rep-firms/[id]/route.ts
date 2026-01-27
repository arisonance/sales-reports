import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('rep_firms_master')
      .select('*, regions(id, name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rep firm not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching rep firm:', error)
    return NextResponse.json({ error: 'Failed to fetch rep firm' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, region_id, active } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('rep_firms_master')
      .update({
        name: name.trim(),
        region_id: region_id || null,
        active: active !== false
      })
      .eq('id', id)
      .select('*, regions(id, name)')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rep firm not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating rep firm:', error)
    return NextResponse.json({ error: 'Failed to update rep firm' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete - mark as inactive instead of hard delete
    // Rep firms may be referenced in historical reports
    const { data, error } = await supabase
      .from('rep_firms_master')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rep firm not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: 'Rep firm marked as inactive' })
  } catch (error) {
    console.error('Error deleting rep firm:', error)
    return NextResponse.json({ error: 'Failed to delete rep firm' }, { status: 500 })
  }
}
