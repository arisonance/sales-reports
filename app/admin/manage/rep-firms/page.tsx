'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import DataTable, { Column } from '@/components/admin/DataTable'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { RepFirmMaster } from '@/lib/supabase'

export default function RepFirmsPage() {
  const router = useRouter()
  const [repFirms, setRepFirms] = useState<RepFirmMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; repFirm: RepFirmMaster | null }>({
    isOpen: false,
    repFirm: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchRepFirms()
  }, [router, showInactive])

  const fetchRepFirms = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/rep-firms?active=${!showInactive}`)
      if (!res.ok) throw new Error('Failed to fetch rep firms')
      const data = await res.json()
      setRepFirms(data)
    } catch (err) {
      console.error('Error fetching rep firms:', err)
      setError('Failed to load rep firms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.repFirm) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/rep-firms/${deleteModal.repFirm.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete rep firm')
      }

      // Soft delete - just mark as inactive, so refresh the list
      await fetchRepFirms()
      setDeleteModal({ isOpen: false, repFirm: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rep firm')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReactivate = async (repFirm: RepFirmMaster) => {
    try {
      const res = await fetch(`/api/rep-firms/${repFirm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: repFirm.name, active: true }),
      })
      if (!res.ok) throw new Error('Failed to reactivate')
      await fetchRepFirms()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate rep firm')
    }
  }

  const entityTypeLabels: Record<string, string> = {
    rep_firm: 'Rep Firm',
    distributor: 'Distributor',
    specialty_account: 'Specialty Account',
  }

  const columns: Column<RepFirmMaster>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'entity_type',
      header: 'Type',
      render: (repFirm) => entityTypeLabels[repFirm.entity_type] || repFirm.entity_type,
    },
    {
      key: 'regions.name',
      header: 'Region',
      render: (repFirm) => repFirm.region?.name || '—',
    },
    {
      key: 'active',
      header: 'Status',
      render: (repFirm) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
            repFirm.active
              ? 'bg-sonance-green/20 text-sonance-green'
              : 'bg-muted/50 text-foreground opacity-60'
          }`}
        >
          {repFirm.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading rep firms...</p>
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
              Manage Rep Firms
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
                Rep Firms
              </h2>
              <p className="text-sm text-foreground opacity-70">
                {repFirms.length} rep firm{repFirms.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-card-border"
                />
                Show Inactive
              </label>
              <Link
                href="/admin/manage/rep-firms/new"
                className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-sm"
              >
                + Add Rep Firm
              </Link>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={repFirms}
            keyField="id"
            editPath={(repFirm) => `/admin/manage/rep-firms/${repFirm.id}`}
            onDelete={(repFirm) => setDeleteModal({ isOpen: true, repFirm })}
            onReactivate={handleReactivate}
            isInactive={(repFirm) => !repFirm.active}
            emptyMessage="No rep firms found. Add your first rep firm to get started."
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, repFirm: null })}
        onConfirm={handleDelete}
        title="Deactivate Rep Firm"
        message={`Are you sure you want to deactivate "${deleteModal.repFirm?.name}"? This will hide it from dropdowns but preserve historical data.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
