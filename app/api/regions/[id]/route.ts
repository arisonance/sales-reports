import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('regions')
      .select('*, parent:regions!parent_id(id, name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching region:', error)
    return NextResponse.json({ error: 'Failed to fetch region' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, parent_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Prevent circular reference (can't be parent of itself)
    if (parent_id === id) {
      return NextResponse.json({ error: 'Region cannot be its own parent' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('regions')
      .update({
        name: name.trim(),
        parent_id: parent_id || null
      })
      .eq('id', id)
      .select('*, parent:regions!parent_id(id, name)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A region with this name already exists' }, { status: 409 })
      }
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating region:', error)
    return NextResponse.json({ error: 'Failed to update region' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if any directors are using this region
    const { data: directors, error: checkError } = await supabase
      .from('directors')
      .select('id')
      .eq('region_id', id)
      .limit(1)

    if (checkError) throw checkError

    if (directors && directors.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete region: it has directors assigned to it' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting region:', error)
    return NextResponse.json({ error: 'Failed to delete region' }, { status: 500 })
  }
}
