'use client'

import { ReportData } from '@/app/report/page'
import { useRef, useState } from 'react'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function MarketingEventsTab({ data, updateData }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Shared file processing function for both click and drag-drop
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    if (!data.directorId) {
      alert('Please wait for the form to load before uploading photos.')
      return
    }

    setUploading(true)

    try {
      const newPhotos = await Promise.all(
        Array.from(files).map(async (file) => {
          // Validate file type and size
          if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file`)
            return null
          }
          if (file.size > 5 * 1024 * 1024) {
            alert(`${file.name} is too large (max 5MB)`)
            return null
          }

          // Upload to Supabase Storage via API
          const formData = new FormData()
          formData.append('file', file)
          formData.append('directorId', data.directorId)
          formData.append('month', data.month)

          const res = await fetch('/api/photos', {
            method: 'POST',
            body: formData
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Upload failed')
          }

          const result = await res.json()
          return result.photo
        })
      )

      const validPhotos = newPhotos.filter((p) => p !== null) as { id: string; filename: string; url: string }[]
      updateData({ photos: [...data.photos, ...validPhotos] })
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      await processFiles(files)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!uploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (uploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await processFiles(files)
    }
  }

  const removePhoto = async (id: string) => {
    try {
      // Delete from Supabase
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: id })
      })

      if (!res.ok) {
        throw new Error('Failed to delete photo')
      }

      updateData({ photos: data.photos.filter((p) => p.id !== id) })
    } catch (error) {
      console.error('Error deleting photo:', error)
      // Still remove from UI even if server delete fails
      updateData({ photos: data.photos.filter((p) => p.id !== id) })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Marketing Activities</h2>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
          Events Attended
        </label>
        <textarea
          value={data.eventsAttended}
          onChange={(e) => updateData({ eventsAttended: e.target.value })}
          placeholder="List trade shows, customer events, training sessions..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
          Marketing Campaigns
        </label>
        <textarea
          value={data.marketingCampaigns}
          onChange={(e) => updateData({ marketingCampaigns: e.target.value })}
          placeholder="Marketing initiatives, promotions, campaigns running in your region..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue resize-none"
        />
      </div>

      <div className="border-t border-card-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">Photos & Visuals</h2>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
            Upload Photos (Events, Projects, Team Photos)
          </label>

          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-all ${
              uploading
                ? 'border-card-border border-dashed bg-muted/30 cursor-not-allowed'
                : isDragging
                ? 'border-sonance-blue border-solid bg-[#00A3E1]/20 scale-[1.02]'
                : 'border-sonance-blue border-dashed hover:border-sonance-blue hover:bg-[#00A3E1]/10'
            }`}
          >
            <div className="text-4xl mb-2">
              {uploading ? (
                <span className="animate-pulse text-foreground">...</span>
              ) : isDragging ? (
                <span role="img" aria-label="drop">
                  ⬇️
                </span>
              ) : (
                <span role="img" aria-label="camera">
                  📷
                </span>
              )}
            </div>
            <p className="text-foreground">
              {uploading ? 'Uploading photos...' : isDragging ? 'Drop photos here' : 'Drag photos here or click to upload'}
            </p>
            <p className="text-foreground opacity-60 text-sm mt-1">Accepted: JPG, PNG, GIF, WebP (Max 5MB each)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {data.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                >
                  x
                </button>
                <p className="text-xs text-foreground opacity-60 mt-1 truncate">{photo.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
