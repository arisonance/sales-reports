import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeParent = searchParams.get('includeParent') === 'true'

    const selectQuery = includeParent
      ? '*, parent:regions!parent_id(id, name)'
      : '*'

    const { data, error } = await supabase
      .from('regions')
      .select(selectQuery)
      .order('name')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, parent_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('regions')
      .insert({
        name: name.trim(),
        parent_id: parent_id || null
      })
      .select('*, parent:regions!parent_id(id, name)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A region with this name already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating region:', error)
    return NextResponse.json({ error: 'Failed to create region' }, { status: 500 })
  }
}
