'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { Region, SalesEntityType } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function RepFirmEditPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [regionId, setRegionId] = useState('')
  const [entityType, setEntityType] = useState<SalesEntityType>('rep_firm')
  const [active, setActive] = useState(true)
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    fetchRegions()
    if (!isNew) {
      fetchRepFirm()
    } else {
      setLoading(false)
    }
  }, [router, id, isNew])

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions')
      if (!res.ok) throw new Error('Failed to fetch regions')
      const data = await res.json()
      setRegions(data)
    } catch (err) {
      console.error('Error fetching regions:', err)
    }
  }

  const fetchRepFirm = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/rep-firms/${id}`)
      if (!res.ok) throw new Error('Failed to fetch rep firm')
      const data = await res.json()
      setName(data.name)
      setRegionId(data.region_id || '')
      setEntityType(data.entity_type || 'rep_firm')
      setActive(data.active)
    } catch (err) {
      console.error('Error fetching rep firm:', err)
      setError('Failed to load rep firm')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = isNew ? '/api/rep-firms' : `/api/rep-firms/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          region_id: regionId || null,
          entity_type: entityType,
          active,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save rep firm')
      }

      router.push('/admin/manage/rep-firms')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rep firm')
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
              {isNew ? 'Add Rep Firm' : 'Edit Rep Firm'}
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
              Rep Firm Details
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
                placeholder="e.g., Pro Tech, Audio Specialists"
                required
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as SalesEntityType)}
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
              >
                <option value="rep_firm">Rep Firm</option>
                <option value="distributor">Distributor</option>
                <option value="specialty_account">Specialty Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                Region (Optional)
              </label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
              >
                <option value="">— No Region —</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {!isNew && (
              <div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-card-border w-4 h-4"
                  />
                  <span className="font-semibold uppercase tracking-wide">Active</span>
                </label>
                <p className="text-xs text-foreground opacity-60 mt-1">
                  Inactive rep firms won&apos;t appear in report dropdowns
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : isNew ? 'Create Rep Firm' : 'Save Changes'}
              </button>
              <Link
                href="/admin/manage/rep-firms"
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
