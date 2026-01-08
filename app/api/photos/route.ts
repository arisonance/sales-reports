import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const directorId = formData.get('directorId') as string
    const month = formData.get('month') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!directorId || !month) {
      return NextResponse.json({ error: 'Director ID and month are required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Check if report exists for this director/month, create if not
    let reportId: string

    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('director_id', directorId)
      .eq('month', month)
      .single()

    if (existingReport) {
      reportId = existingReport.id
    } else {
      // Create a new draft report
      const { data: newReport, error: createError } = await supabase
        .from('reports')
        .insert({
          director_id: directorId,
          month,
          executive_summary: '',
          status: 'draft'
        })
        .select()
        .single()

      if (createError) throw createError
      reportId = newReport.id
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${reportId}/${timestamp}.${ext}`

    // Convert file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('report-photos')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('report-photos')
      .getPublicUrl(filename)

    // Save to photos table
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        report_id: reportId,
        filename: file.name,
        url: urlData.publicUrl
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        filename: photo.filename,
        url: photo.url
      }
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: 'No photo ID provided' }, { status: 400 })
    }

    // Get photo info first
    const { data: photo } = await supabase
      .from('photos')
      .select('url')
      .eq('id', photoId)
      .single()

    // Delete from storage if URL exists
    if (photo?.url) {
      // Extract the path from the URL
      const urlParts = photo.url.split('/report-photos/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('report-photos')
          .remove([filePath])
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
