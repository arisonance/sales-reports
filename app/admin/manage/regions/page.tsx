'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import DataTable, { Column } from '@/components/admin/DataTable'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { Region } from '@/lib/supabase'

export default function RegionsPage() {
  const router = useRouter()
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; region: Region | null }>({
    isOpen: false,
    region: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchRegions()
  }, [router])

  const fetchRegions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/regions')
      if (!res.ok) throw new Error('Failed to fetch regions')
      const data = await res.json()
      setRegions(data)
    } catch (err) {
      console.error('Error fetching regions:', err)
      setError('Failed to load regions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.region) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/regions/${deleteModal.region.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete region')
      }

      setRegions((prev) => prev.filter((r) => r.id !== deleteModal.region!.id))
      setDeleteModal({ isOpen: false, region: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete region')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Region>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'created_at',
      header: 'Created',
      render: (region) =>
        new Date(region.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading regions...</p>
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
              Manage Regions
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

        <div className="bg-card-bg rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                Regions
              </h2>
              <p className="text-sm text-foreground opacity-70">
                {regions.length} region{regions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/admin/manage/regions/new"
              className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-sm"
            >
              + Add Region
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={regions}
            keyField="id"
            editPath={(region) => `/admin/manage/regions/${region.id}`}
            onDelete={(region) => setDeleteModal({ isOpen: true, region })}
            emptyMessage="No regions found. Add your first region to get started."
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, region: null })}
        onConfirm={handleDelete}
        title="Delete Region"
        message={`Are you sure you want to delete "${deleteModal.region?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
