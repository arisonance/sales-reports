'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { Director, Region, RepFirmMaster, CustomerMaster, SalesEntityType } from '@/lib/supabase'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type DeleteType = 'director' | 'region' | 'rep_firm' | 'customer'
interface DeleteModalState {
  isOpen: boolean
  type: DeleteType
  item: Director | Region | RepFirmMaster | CustomerMaster | null
}

interface DirectorSetup {
  director: Director
  primary_region_id: string | null
  additional_region_ids: string[]
  rep_firm_ids: string[]
  customer_ids: string[]
  channel_types: SalesEntityType[]
  uses_direct_customers: boolean
}

// Channel type definitions for the UI
const CHANNEL_CONFIG = [
  { id: 'rep_firm' as SalesEntityType, label: 'Rep Firms', description: 'Independent sales representatives (domestic)' },
  { id: 'distributor' as SalesEntityType, label: 'Distributors', description: 'Distribution partners (international)' },
  { id: 'specialty_account' as SalesEntityType, label: 'Specialty Accounts', description: 'Strategic specialty partners' },
] as const

export default function SetupWizardPage() {
  const router = useRouter()

  // Master data
  const [directors, setDirectors] = useState<Director[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [repFirms, setRepFirms] = useState<RepFirmMaster[]>([])
  const [customers, setCustomers] = useState<CustomerMaster[]>([])

  // Form state
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>('')
  const [primaryRegionId, setPrimaryRegionId] = useState<string>('')
  const [additionalRegionIds, setAdditionalRegionIds] = useState<string[]>([])
  const [repFirmIds, setRepFirmIds] = useState<string[]>([])
  const [customerIds, setCustomerIds] = useState<string[]>([])

  // Channel configuration state
  const [channelTypes, setChannelTypes] = useState<SalesEntityType[]>([])
  const [usesDirectCustomers, setUsesDirectCustomers] = useState(false)

  // Search filters
  const [repFirmSearch, setRepFirmSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  // Add new item forms
  const [showAddRegion, setShowAddRegion] = useState(false)
  const [newRegionName, setNewRegionName] = useState('')
  const [addingRegion, setAddingRegion] = useState(false)

  const [showAddRepFirm, setShowAddRepFirm] = useState(false)
  const [newRepFirmName, setNewRepFirmName] = useState('')
  const [newRepFirmRegionId, setNewRepFirmRegionId] = useState('')
  const [newRepFirmEntityType, setNewRepFirmEntityType] = useState<SalesEntityType>('rep_firm')
  const [addingRepFirm, setAddingRepFirm] = useState(false)

  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [addingCustomer, setAddingCustomer] = useState(false)

  // Add director form
  const [showAddDirector, setShowAddDirector] = useState(false)
  const [newDirectorName, setNewDirectorName] = useState('')
  const [newDirectorEmail, setNewDirectorEmail] = useState('')
  const [addingDirector, setAddingDirector] = useState(false)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'director',
    item: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // UI state
  const [loading, setLoading] = useState(true)
  const [loadingSetup, setLoadingSetup] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({})
  const [retrying, setRetrying] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchAllData()
  }, [router])

  const fetchEndpoint = async <T,>(
    key: string,
    url: string,
    setter: (data: T) => void,
  ): Promise<{ key: string; error?: string }> => {
    const result = await fetchWithRetry<T>(url)
    if (result.success) {
      setter(result.data!)
      return { key }
    }
    return { key, error: result.error }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setLoadErrors({})

    const results = await Promise.all([
      fetchEndpoint<Director[]>('Directors', '/api/directors', setDirectors),
      fetchEndpoint<Region[]>('Regions', '/api/regions', setRegions),
      fetchEndpoint<RepFirmMaster[]>('Rep Firms', '/api/rep-firms', setRepFirms),
      fetchEndpoint<CustomerMaster[]>('Customers', '/api/customers', setCustomers),
    ])

    const errors: Record<string, string> = {}
    for (const r of results) {
      if (r.error) errors[r.key] = r.error
    }
    setLoadErrors(errors)
    setLoading(false)
  }

  const retryEndpoint = async (key: string) => {
    const config: Record<string, { url: string; setter: (data: unknown) => void }> = {
      Directors: { url: '/api/directors', setter: (d) => setDirectors(d as Director[]) },
      Regions: { url: '/api/regions', setter: (d) => setRegions(d as Region[]) },
      'Rep Firms': { url: '/api/rep-firms', setter: (d) => setRepFirms(d as RepFirmMaster[]) },
      Customers: { url: '/api/customers', setter: (d) => setCustomers(d as CustomerMaster[]) },
    }
    const c = config[key]
    if (!c) return

    setRetrying(prev => ({ ...prev, [key]: true }))
    const result = await fetchWithRetry(c.url)
    if (result.success) {
      c.setter(result.data)
      setLoadErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      setLoadErrors(prev => ({ ...prev, [key]: result.error || 'Failed' }))
    }
    setRetrying(prev => ({ ...prev, [key]: false }))
  }

  const retryAll = async () => {
    const keys = Object.keys(loadErrors)
    await Promise.all(keys.map(k => retryEndpoint(k)))
  }

  const handleDirectorChange = async (directorId: string) => {
    setSelectedDirectorId(directorId)
    setError('')
    setSuccess('')

    if (!directorId) {
      // Reset form
      setPrimaryRegionId('')
      setAdditionalRegionIds([])
      setRepFirmIds([])
      setCustomerIds([])
      setChannelTypes([])
      setUsesDirectCustomers(false)
      return
    }

    try {
      setLoadingSetup(true)
      const res = await fetch(`/api/directors/${directorId}/setup`)
      if (!res.ok) throw new Error('Failed to fetch director setup')

      const data: DirectorSetup = await res.json()
      setPrimaryRegionId(data.primary_region_id || '')
      setAdditionalRegionIds(data.additional_region_ids || [])
      setRepFirmIds(data.rep_firm_ids || [])
      setCustomerIds(data.customer_ids || [])
      setChannelTypes(data.channel_types || [])
      setUsesDirectCustomers(data.uses_direct_customers || false)
    } catch (err) {
      console.error('Error fetching director setup:', err)
      setError('Failed to load director setup')
    } finally {
      setLoadingSetup(false)
    }
  }

  const handleAdditionalRegionToggle = (regionId: string) => {
    setAdditionalRegionIds(prev =>
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    )
  }

  const handleRepFirmToggle = (repFirmId: string) => {
    setRepFirmIds(prev =>
      prev.includes(repFirmId)
        ? prev.filter(id => id !== repFirmId)
        : [...prev, repFirmId]
    )
  }

  const handleCustomerToggle = (customerId: string) => {
    setCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleChannelTypeToggle = (channelType: SalesEntityType) => {
    setChannelTypes(prev =>
      prev.includes(channelType)
        ? prev.filter(c => c !== channelType)
        : [...prev, channelType]
    )
  }

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) return

    setAddingRegion(true)
    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRegionName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add region')
      }

      const newRegion = await res.json()
      setRegions(prev => [...prev, newRegion].sort((a, b) => a.name.localeCompare(b.name)))
      setNewRegionName('')
      setShowAddRegion(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add region')
    } finally {
      setAddingRegion(false)
    }
  }

  const handleAddRepFirm = async (entityType: SalesEntityType = newRepFirmEntityType) => {
    if (!newRepFirmName.trim()) return

    setAddingRepFirm(true)
    try {
      const res = await fetch('/api/rep-firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRepFirmName.trim(),
          region_id: newRepFirmRegionId || null,
          entity_type: entityType,
        }),
      })

      if (!res.ok) throw new Error('Failed to add entity')

      const newEntity = await res.json()
      setRepFirms(prev => [...prev, newEntity])
      setNewRepFirmName('')
      setNewRepFirmRegionId('')
      setNewRepFirmEntityType('rep_firm')
      setShowAddRepFirm(false)
    } catch (err) {
      setError('Failed to add entity')
    } finally {
      setAddingRepFirm(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return

    setAddingCustomer(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerName.trim(),
        }),
      })

      if (!res.ok) throw new Error('Failed to add customer')

      const newCustomer = await res.json()
      setCustomers(prev => [...prev, newCustomer])
      setNewCustomerName('')
      setShowAddCustomer(false)
    } catch (err) {
      setError('Failed to add customer')
    } finally {
      setAddingCustomer(false)
    }
  }

  const handleAddDirector = async () => {
    if (!newDirectorName.trim() || !newDirectorEmail.trim()) return

    setAddingDirector(true)
    try {
      const res = await fetch('/api/directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDirectorName.trim(),
          email: newDirectorEmail.trim().toLowerCase(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add director')
      }

      const newDirector = await res.json()
      setDirectors(prev => [...prev, newDirector].sort((a, b) => a.name.localeCompare(b.name)))
      setNewDirectorName('')
      setNewDirectorEmail('')
      setShowAddDirector(false)
      setSuccess(`Director "${newDirector.name}" added. Select them from the dropdown to configure.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add director')
    } finally {
      setAddingDirector(false)
    }
  }

  const openDeleteModal = (type: DeleteType, item: Director | Region | RepFirmMaster | CustomerMaster) => {
    setDeleteModal({ isOpen: true, type, item })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: 'director', item: null })
  }

  const getDeleteTitle = () => {
    switch (deleteModal.type) {
      case 'director': return 'Delete Director'
      case 'region': return 'Delete Region'
      case 'rep_firm': return 'Deactivate Rep Firm'
      case 'customer': return 'Deactivate Customer'
    }
  }

  const getDeleteMessage = () => {
    if (!deleteModal.item) return ''
    const name = deleteModal.item.name
    switch (deleteModal.type) {
      case 'director':
        return `Are you sure you want to delete "${name}"? This cannot be undone.`
      case 'region':
        return `Are you sure you want to delete "${name}"? This cannot be undone.`
      case 'rep_firm':
        return `Are you sure you want to deactivate "${name}"? This will hide it from dropdowns but preserve historical data.`
      case 'customer':
        return `Are you sure you want to deactivate "${name}"? This will hide it from dropdowns but preserve historical data.`
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.item) return

    const { type, item } = deleteModal

    // Prevent deleting the currently selected director
    if (type === 'director' && item.id === selectedDirectorId) {
      setError('Cannot delete the currently selected director. Select a different director first.')
      closeDeleteModal()
      return
    }

    // Prevent deleting the primary region
    if (type === 'region' && item.id === primaryRegionId) {
      setError('Cannot delete the primary region. Select a different primary region first.')
      closeDeleteModal()
      return
    }

    setIsDeleting(true)
    try {
      let endpoint = ''
      switch (type) {
        case 'director':
          endpoint = `/api/directors/${item.id}`
          break
        case 'region':
          endpoint = `/api/regions/${item.id}`
          break
        case 'rep_firm':
          endpoint = `/api/rep-firms/${item.id}`
          break
        case 'customer':
          endpoint = `/api/customers/${item.id}`
          break
      }

      const res = await fetch(endpoint, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to delete ${type}`)
      }

      // Update local state based on type
      switch (type) {
        case 'director':
          setDirectors(prev => prev.filter(d => d.id !== item.id))
          break
        case 'region':
          setRegions(prev => prev.filter(r => r.id !== item.id))
          // Clean up region from additional regions if selected
          setAdditionalRegionIds(prev => prev.filter(id => id !== item.id))
          break
        case 'rep_firm':
          setRepFirms(prev => prev.filter(rf => rf.id !== item.id))
          // Clean up from selection
          setRepFirmIds(prev => prev.filter(id => id !== item.id))
          break
        case 'customer':
          setCustomers(prev => prev.filter(c => c.id !== item.id))
          // Clean up from selection
          setCustomerIds(prev => prev.filter(id => id !== item.id))
          break
      }

      closeDeleteModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${type}`)
      closeDeleteModal()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!selectedDirectorId) {
      setError('Please select a director')
      return
    }

    if (!primaryRegionId) {
      setError('Please select a primary region')
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch(`/api/directors/${selectedDirectorId}/setup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_region_id: primaryRegionId,
          additional_region_ids: additionalRegionIds,
          rep_firm_ids: repFirmIds,
          customer_ids: usesDirectCustomers ? customerIds : [],
          channel_types: channelTypes,
          uses_direct_customers: usesDirectCustomers,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save setup')
      }

      setSuccess('Setup saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setup')
    } finally {
      setSaving(false)
    }
  }

  // Filter entities by search
  const filterRepFirms = (firms: RepFirmMaster[]) => {
    if (!repFirmSearch) return firms
    return firms.filter(rf =>
      rf.name.toLowerCase().includes(repFirmSearch.toLowerCase())
    )
  }

  // Filter customers by search
  const filteredCustomers = customers.filter(c =>
    !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  // Filter entities by type
  const getEntitiesByType = (entityType: SalesEntityType) => {
    return repFirms.filter(rf => rf.entity_type === entityType)
  }

  // Get entity type label
  const getEntityTypeLabel = (entityType: SalesEntityType) => {
    const config = CHANNEL_CONFIG.find(c => c.id === entityType)
    return config?.label || entityType
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
              Setup Wizard
            </h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdminNav />

        {Object.keys(loadErrors).length > 0 && (
          <div className="bg-red-100 border border-red-400 rounded-lg mb-6 overflow-hidden">
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-red-800">
                Failed to load data
              </span>
              <div className="flex items-center gap-2">
                {Object.keys(loadErrors).length > 1 && (
                  <button
                    onClick={retryAll}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold uppercase tracking-wide"
                  >
                    Retry All
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 pb-3 space-y-2">
              {Object.entries(loadErrors).map(([key, msg]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-red-700">
                    <span className="font-semibold">{key}:</span> {msg}
                  </span>
                  <button
                    onClick={() => retryEndpoint(key)}
                    disabled={retrying[key]}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-semibold uppercase tracking-wide"
                  >
                    {retrying[key] ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Director Selection */}
        <div className="bg-card-bg rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-card-border flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                Select Director
              </h2>
              <p className="text-sm text-foreground opacity-70">
                Choose a director to configure their assignments
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDirector(!showAddDirector)}
              className="px-3 py-1.5 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-xs"
            >
              + Add Director
            </button>
          </div>
          <div className="p-6 space-y-4">
            {/* Add New Director Form */}
            {showAddDirector && (
              <div className="p-4 bg-sonance-blue/5 border border-sonance-blue/20 rounded-lg">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newDirectorName}
                      onChange={(e) => setNewDirectorName(e.target.value)}
                      placeholder="e.g., John Smith"
                      className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newDirectorEmail}
                      onChange={(e) => setNewDirectorEmail(e.target.value)}
                      placeholder="e.g., john@sonance.com"
                      className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDirector}
                    disabled={addingDirector || !newDirectorName.trim() || !newDirectorEmail.trim()}
                    className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-xs disabled:opacity-50"
                  >
                    {addingDirector ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDirector(false)
                      setNewDirectorName('')
                      setNewDirectorEmail('')
                    }}
                    className="px-4 py-2 border border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 items-center">
              <select
                value={selectedDirectorId}
                onChange={(e) => handleDirectorChange(e.target.value)}
                className="flex-1 max-w-md px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
              >
                <option value="">-- Select a Director --</option>
                {directors.map((director) => (
                  <option key={director.id} value={director.id}>
                    {director.name} ({director.email})
                  </option>
                ))}
              </select>
              {selectedDirectorId && (
                <button
                  type="button"
                  onClick={() => {
                    const director = directors.find(d => d.id === selectedDirectorId)
                    if (director) openDeleteModal('director', director)
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete this director"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {loadingSetup ? (
          <div className="bg-card-bg rounded-lg shadow p-6 text-center">
            <p className="text-foreground opacity-70">Loading director setup...</p>
          </div>
        ) : selectedDirectorId ? (
          <>
            {/* Sales Channel Configuration */}
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  Sales Channel Configuration
                </h2>
                <p className="text-sm text-foreground opacity-70">
                  Select which sales channels this director manages
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CHANNEL_CONFIG.map((channel) => (
                    <label
                      key={channel.id}
                      className={`
                        flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${channelTypes.includes(channel.id)
                          ? 'border-sonance-blue bg-sonance-blue/5'
                          : 'border-card-border hover:border-sonance-blue/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={channelTypes.includes(channel.id)}
                          onChange={() => handleChannelTypeToggle(channel.id)}
                          className="w-5 h-5 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                        />
                        <span className="font-semibold text-foreground">{channel.label}</span>
                      </div>
                      <span className="text-xs text-foreground opacity-60">{channel.description}</span>
                    </label>
                  ))}
                  {/* Direct Customers - separate flag */}
                  <label
                    className={`
                      flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${usesDirectCustomers
                        ? 'border-sonance-blue bg-sonance-blue/5'
                        : 'border-card-border hover:border-sonance-blue/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={usesDirectCustomers}
                        onChange={() => setUsesDirectCustomers(!usesDirectCustomers)}
                        className="w-5 h-5 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                      />
                      <span className="font-semibold text-foreground">Direct Customers</span>
                    </div>
                    <span className="text-xs text-foreground opacity-60">End customers managed directly</span>
                  </label>
                </div>
                {channelTypes.length === 0 && !usesDirectCustomers && (
                  <p className="mt-4 text-sm text-amber-600">
                    Please select at least one sales channel type
                  </p>
                )}
              </div>
            </div>

            {/* Region Assignment */}
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                    Region Assignment
                  </h2>
                  <p className="text-sm text-foreground opacity-70">
                    Assign primary and additional regions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRegion(!showAddRegion)}
                  className="px-3 py-1.5 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-xs"
                >
                  + Add Region
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Add New Region Form */}
                {showAddRegion && (
                  <div className="p-4 bg-sonance-blue/5 border border-sonance-blue/20 rounded-lg">
                    <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                          Region Name
                        </label>
                        <input
                          type="text"
                          value={newRegionName}
                          onChange={(e) => setNewRegionName(e.target.value)}
                          placeholder="e.g., Northeast"
                          className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRegion}
                        disabled={addingRegion || !newRegionName.trim()}
                        className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-xs disabled:opacity-50"
                      >
                        {addingRegion ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRegion(false)
                          setNewRegionName('')
                        }}
                        className="px-4 py-2 border border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* Primary Region */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Primary Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={primaryRegionId}
                    onChange={(e) => setPrimaryRegionId(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                  >
                    <option value="">-- Select Primary Region --</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Regions */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Additional Regions
                  </label>
                  <p className="text-sm text-foreground opacity-60 mb-3">
                    Select any additional regions this director can access
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-card-border rounded-lg bg-input-bg">
                    {regions
                      .filter(r => r.id !== primaryRegionId)
                      .map((region) => (
                        <div
                          key={region.id}
                          className="group flex items-center justify-between p-2 rounded hover:bg-muted/50"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={additionalRegionIds.includes(region.id)}
                              onChange={() => handleAdditionalRegionToggle(region.id)}
                              className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                            />
                            <span className="text-sm text-foreground">{region.name}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => openDeleteModal('region', region)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                            title="Delete region"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Entity Sections - One for each enabled channel type */}
            {channelTypes.map((channelType) => {
              const typeEntities = getEntitiesByType(channelType)
              const filteredEntities = filterRepFirms(typeEntities)
              const selectedCount = typeEntities.filter(e => repFirmIds.includes(e.id)).length
              const channelLabel = getEntityTypeLabel(channelType)

              return (
                <div key={channelType} className="bg-card-bg rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-card-border flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                        {channelLabel} Assignment
                      </h2>
                      <p className="text-sm text-foreground opacity-70">
                        Select {channelLabel.toLowerCase()} this director manages
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewRepFirmEntityType(channelType)
                        setShowAddRepFirm(!showAddRepFirm)
                      }}
                      className="px-3 py-1.5 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-xs"
                    >
                      + Add {channelLabel.replace(/s$/, '')}
                    </button>
                  </div>
                  <div className="p-6">
                    {/* Add New Entity Form */}
                    {showAddRepFirm && newRepFirmEntityType === channelType && (
                      <div className="mb-4 p-4 bg-sonance-blue/5 border border-sonance-blue/20 rounded-lg">
                        <div className="flex flex-wrap gap-3 items-end">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                              Name
                            </label>
                            <input
                              type="text"
                              value={newRepFirmName}
                              onChange={(e) => setNewRepFirmName(e.target.value)}
                              placeholder={`e.g., ${channelType === 'rep_firm' ? 'ABC Representatives' : channelType === 'distributor' ? 'Mexico Distribution Co' : 'Strategic Partner Inc'}`}
                              className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                            />
                          </div>
                          <div className="w-48">
                            <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                              Region (Optional)
                            </label>
                            <select
                              value={newRepFirmRegionId}
                              onChange={(e) => setNewRepFirmRegionId(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                            >
                              <option value="">-- No Region --</option>
                              {regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                  {region.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddRepFirm(channelType)}
                            disabled={addingRepFirm || !newRepFirmName.trim()}
                            className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-xs disabled:opacity-50"
                          >
                            {addingRepFirm ? 'Adding...' : 'Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddRepFirm(false)
                              setNewRepFirmName('')
                              setNewRepFirmRegionId('')
                            }}
                            className="px-4 py-2 border border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Search */}
                    <input
                      type="text"
                      placeholder={`Search ${channelLabel.toLowerCase()}...`}
                      value={repFirmSearch}
                      onChange={(e) => setRepFirmSearch(e.target.value)}
                      className="w-full max-w-md px-4 py-2 mb-4 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-card-border rounded-lg bg-input-bg">
                      {filteredEntities.map((entity) => (
                        <div
                          key={entity.id}
                          className="group flex items-center justify-between p-2 rounded hover:bg-muted/50"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={repFirmIds.includes(entity.id)}
                              onChange={() => handleRepFirmToggle(entity.id)}
                              className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                            />
                            <span className="text-sm text-foreground">{entity.name}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => openDeleteModal('rep_firm', entity)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                            title={`Deactivate ${channelLabel.toLowerCase().replace(/s$/, '')}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {filteredEntities.length === 0 && (
                        <p className="col-span-full text-foreground opacity-60 text-center py-4">
                          {typeEntities.length === 0
                            ? `No ${channelLabel.toLowerCase()} available. Click "+ Add" above to create one.`
                            : `No ${channelLabel.toLowerCase()} match your search.`}
                        </p>
                      )}
                    </div>

                    {selectedCount > 0 && (
                      <p className="mt-4 text-sm text-foreground opacity-70">
                        {selectedCount} {channelLabel.toLowerCase()}{selectedCount !== 1 ? '' : ''} selected
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Direct Customer Assignment - Only show if usesDirectCustomers is enabled */}
            {usesDirectCustomers && (
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                    Direct Customer Assignment
                  </h2>
                  <p className="text-sm text-foreground opacity-70">
                    Select direct customers this director manages
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  className="px-3 py-1.5 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-xs"
                >
                  + Add Customer
                </button>
              </div>
              <div className="p-6">
                {/* Add New Customer Form */}
                {showAddCustomer && (
                  <div className="mb-4 p-4 bg-sonance-blue/5 border border-sonance-blue/20 rounded-lg">
                    <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          placeholder="e.g., Acme Corporation"
                          className="w-full px-3 py-2 border-2 border-card-border rounded-lg bg-input-bg text-foreground text-sm focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomer}
                        disabled={addingCustomer || !newCustomerName.trim()}
                        className="px-4 py-2 bg-sonance-blue text-white rounded-lg hover:bg-sonance-blue/90 transition-colors font-semibold uppercase tracking-wide text-xs disabled:opacity-50"
                      >
                        {addingCustomer ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCustomer(false)
                          setNewCustomerName('')
                        }}
                        className="px-4 py-2 border border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full max-w-md px-4 py-2 mb-4 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-card-border rounded-lg bg-input-bg">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="group flex items-center justify-between p-2 rounded hover:bg-muted/50"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={customerIds.includes(customer.id)}
                          onChange={() => handleCustomerToggle(customer.id)}
                          className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                        />
                        <span className="text-sm text-foreground">{customer.name}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => openDeleteModal('customer', customer)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                        title="Deactivate customer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="col-span-full text-foreground opacity-60 text-center py-4">
                      {customers.length === 0
                        ? 'No customers available. Add customers in the Manage section first.'
                        : 'No customers match your search.'}
                    </p>
                  )}
                </div>

                {customerIds.length > 0 && (
                  <p className="mt-4 text-sm text-foreground opacity-70">
                    {customerIds.length} customer{customerIds.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !primaryRegionId}
                className="px-6 py-3 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Setup'}
              </button>
              <Link
                href="/admin/manage"
                className="px-6 py-3 border-2 border-card-border rounded-lg text-foreground hover:bg-muted/50 transition-colors font-semibold uppercase tracking-wide text-sm"
              >
                Cancel
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-card-bg rounded-lg shadow p-12 text-center">
            <p className="text-foreground opacity-60">
              Select a director above to configure their assignments
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={getDeleteTitle()}
        message={getDeleteMessage()}
        isDeleting={isDeleting}
      />
    </div>
  )
}
