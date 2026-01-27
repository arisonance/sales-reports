import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('directors')
      .select('*, regions(id, name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Director not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching director:', error)
    return NextResponse.json({ error: 'Failed to fetch director' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, region_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get region name for legacy field
    let regionName = ''
    if (region_id) {
      const { data: region } = await supabase
        .from('regions')
        .select('name')
        .eq('id', region_id)
        .single()
      regionName = region?.name || ''
    }

    const { data, error } = await supabase
      .from('directors')
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        region: regionName,
        region_id: region_id || null
      })
      .eq('id', id)
      .select('*, regions(id, name)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A director with this email already exists' }, { status: 409 })
      }
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Director not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating director:', error)
    return NextResponse.json({ error: 'Failed to update director' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if director has any reports
    const { data: reports, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('director_id', id)
      .limit(1)

    if (checkError) throw checkError

    if (reports && reports.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete director: they have reports in the system' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('directors')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting director:', error)
    return NextResponse.json({ error: 'Failed to delete director' }, { status: 500 })
  }
}
