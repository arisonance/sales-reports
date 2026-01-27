'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

interface Props {
  params: Promise<{ id: string }>
}

export default function RegionEditPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    if (!isNew) {
      fetchRegion()
    }
  }, [router, id, isNew])

  const fetchRegion = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/regions/${id}`)
      if (!res.ok) throw new Error('Failed to fetch region')
      const data = await res.json()
      setName(data.name)
    } catch (err) {
      console.error('Error fetching region:', err)
      setError('Failed to load region')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = isNew ? '/api/regions' : `/api/regions/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save region')
      }

      router.push('/admin/manage/regions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save region')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <div className="bg-card-bg shadow">
        <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-6"
            />
            <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
              {isNew ? 'Add Region' : 'Edit Region'}
            </h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdminNav />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-card-bg rounded-lg shadow max-w-xl">
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
              Region Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., West, Southeast, Central"
                required
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : isNew ? 'Create Region' : 'Save Changes'}
              </button>
              <Link
                href="/admin/manage/regions"
                className="px-6 py-2 border-2 border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors font-semibold uppercase tracking-wide text-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
