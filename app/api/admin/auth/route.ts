import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Temporarily bypass password for colleague testing
  return NextResponse.json({ success: true })
}
