'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import DataTable, { Column } from '@/components/admin/DataTable'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { Director } from '@/lib/supabase'

export default function DirectorsPage() {
  const router = useRouter()
  const [directors, setDirectors] = useState<Director[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; director: Director | null }>({
    isOpen: false,
    director: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchDirectors()
  }, [router])

  const fetchDirectors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/directors')
      if (!res.ok) throw new Error('Failed to fetch directors')
      const data = await res.json()
      setDirectors(data)
    } catch (err) {
      console.error('Error fetching directors:', err)
      setError('Failed to load directors')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.director) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/directors/${deleteModal.director.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete director')
      }

      setDirectors((prev) => prev.filter((d) => d.id !== deleteModal.director!.id))
      setDeleteModal({ isOpen: false, director: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete director')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Director>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'region',
      header: 'Region',
      render: (director) => director.regions?.name || director.region || '—',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading directors...</p>
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
              Manage Directors
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
                Directors
              </h2>
              <p className="text-sm text-foreground opacity-70">
                {directors.length} director{directors.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/admin/manage/directors/new"
              className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-sm"
            >
              + Add Director
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={directors}
            keyField="id"
            editPath={(director) => `/admin/manage/directors/${director.id}`}
            onDelete={(director) => setDeleteModal({ isOpen: true, director })}
            emptyMessage="No directors found. Add your first director to get started."
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, director: null })}
        onConfirm={handleDelete}
        title="Delete Director"
        message={`Are you sure you want to delete "${deleteModal.director?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
