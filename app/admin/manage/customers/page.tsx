'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import DataTable, { Column } from '@/components/admin/DataTable'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { CustomerMaster } from '@/lib/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: CustomerMaster | null }>({
    isOpen: false,
    customer: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchCustomers()
  }, [router, showInactive])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/customers?active=${!showInactive}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.customer) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/customers/${deleteModal.customer.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete customer')
      }

      await fetchCustomers()
      setDeleteModal({ isOpen: false, customer: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<CustomerMaster>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'active',
      header: 'Status',
      render: (customer) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
            customer.active
              ? 'bg-sonance-green/20 text-sonance-green'
              : 'bg-muted/50 text-foreground opacity-60'
          }`}
        >
          {customer.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <p className="text-foreground">Loading customers...</p>
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
              Manage Customers
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
                Customers
              </h2>
              <p className="text-sm text-foreground opacity-70">
                {customers.length} customer{customers.length !== 1 ? 's' : ''} (for Strategic Accounts)
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
                href="/admin/manage/customers/new"
                className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-sm"
              >
                + Add Customer
              </Link>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={customers}
            keyField="id"
            editPath={(customer) => `/admin/manage/customers/${customer.id}`}
            onDelete={(customer) => setDeleteModal({ isOpen: true, customer })}
            emptyMessage="No customers found. Add your first customer to get started."
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customer: null })}
        onConfirm={handleDelete}
        title="Deactivate Customer"
        message={`Are you sure you want to deactivate "${deleteModal.customer?.name}"? This will hide it from dropdowns but preserve historical data.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
