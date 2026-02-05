import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get customers assigned to a specific director
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get customers assigned to this director via director_customer_access table
    const { data: customerAccess, error } = await supabase
      .from('director_customer_access')
      .select(`
        customer_id,
        customers_master (
          id,
          name
        )
      `)
      .eq('director_id', id)

    if (error) throw error

    // Extract the customer data from the joined result
    const customers = customerAccess
      ?.map(item => item.customers_master)
      .filter(Boolean) || []

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching director customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
