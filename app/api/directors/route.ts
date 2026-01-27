import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('directors')
      .select('*, regions(id, name)')
      .order('name')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching directors:', error)
    return NextResponse.json({ error: 'Failed to fetch directors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        region: regionName,
        region_id: region_id || null
      })
      .select('*, regions(id, name)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A director with this email already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating director:', error)
    return NextResponse.json({ error: 'Failed to create director' }, { status: 500 })
  }
}
