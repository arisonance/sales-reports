'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import { Director, Region, RepFirmMaster, CustomerMaster } from '@/lib/supabase'

interface DirectorSetup {
  director: Director
  primary_region_id: string | null
  additional_region_ids: string[]
  rep_firm_ids: string[]
  customer_ids: string[]
}

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

  // Search filters
  const [repFirmSearch, setRepFirmSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [loadingSetup, setLoadingSetup] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [directorsRes, regionsRes, repFirmsRes, customersRes] = await Promise.all([
        fetch('/api/directors'),
        fetch('/api/regions'),
        fetch('/api/rep-firms'),
        fetch('/api/customers'),
      ])

      if (!directorsRes.ok || !regionsRes.ok || !repFirmsRes.ok || !customersRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [directorsData, regionsData, repFirmsData, customersData] = await Promise.all([
        directorsRes.json(),
        regionsRes.json(),
        repFirmsRes.json(),
        customersRes.json(),
      ])

      setDirectors(directorsData)
      setRegions(regionsData)
      setRepFirms(repFirmsData)
      setCustomers(customersData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
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

  const handleSelectAllRepFirmsFromRegion = (regionId: string) => {
    const regionRepFirmIds = repFirms
      .filter(rf => rf.region_id === regionId)
      .map(rf => rf.id)

    const allSelected = regionRepFirmIds.every(id => repFirmIds.includes(id))

    if (allSelected) {
      // Deselect all from this region
      setRepFirmIds(prev => prev.filter(id => !regionRepFirmIds.includes(id)))
    } else {
      // Select all from this region
      setRepFirmIds(prev => [...new Set([...prev, ...regionRepFirmIds])])
    }
  }

  const handleCustomerToggle = (customerId: string) => {
    setCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
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
          customer_ids: customerIds,
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

  // Group rep firms by region for display
  const repFirmsByRegion = regions.reduce((acc, region) => {
    const regionRepFirms = repFirms.filter(rf => rf.region_id === region.id)
    if (regionRepFirms.length > 0) {
      acc[region.id] = {
        region,
        repFirms: regionRepFirms,
      }
    }
    return acc
  }, {} as Record<string, { region: Region; repFirms: RepFirmMaster[] }>)

  // Rep firms without a region
  const unassignedRepFirms = repFirms.filter(rf => !rf.region_id)

  // Filter rep firms by search
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

  // Get selected regions for highlighting
  const selectedRegionIds = [primaryRegionId, ...additionalRegionIds].filter(Boolean)

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
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
              Select Director
            </h2>
            <p className="text-sm text-foreground opacity-70">
              Choose a director to configure their assignments
            </p>
          </div>
          <div className="p-6">
            <select
              value={selectedDirectorId}
              onChange={(e) => handleDirectorChange(e.target.value)}
              className="w-full max-w-md px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
            >
              <option value="">-- Select a Director --</option>
              {directors.map((director) => (
                <option key={director.id} value={director.id}>
                  {director.name} ({director.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingSetup ? (
          <div className="bg-card-bg rounded-lg shadow p-6 text-center">
            <p className="text-foreground opacity-70">Loading director setup...</p>
          </div>
        ) : selectedDirectorId ? (
          <>
            {/* Region Assignment */}
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  Region Assignment
                </h2>
                <p className="text-sm text-foreground opacity-70">
                  Assign primary and additional regions
                </p>
              </div>
              <div className="p-6 space-y-6">
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
                        <label
                          key={region.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={additionalRegionIds.includes(region.id)}
                            onChange={() => handleAdditionalRegionToggle(region.id)}
                            className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                          />
                          <span className="text-sm text-foreground">{region.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rep Firm Assignment */}
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  Rep Firm Assignment
                </h2>
                <p className="text-sm text-foreground opacity-70">
                  Select rep firms this director can include in reports
                </p>
              </div>
              <div className="p-6">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search rep firms..."
                  value={repFirmSearch}
                  onChange={(e) => setRepFirmSearch(e.target.value)}
                  className="w-full max-w-md px-4 py-2 mb-4 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                />

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Rep firms grouped by region */}
                  {Object.entries(repFirmsByRegion).map(([regionId, { region, repFirms: regionRepFirms }]) => {
                    const filtered = filterRepFirms(regionRepFirms)
                    if (filtered.length === 0) return null

                    const allSelected = filtered.every(rf => repFirmIds.includes(rf.id))
                    const isSelectedRegion = selectedRegionIds.includes(regionId)

                    return (
                      <div
                        key={regionId}
                        className={`border rounded-lg p-4 ${
                          isSelectedRegion
                            ? 'border-sonance-blue/50 bg-sonance-blue/5'
                            : 'border-card-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">
                            {region.name}
                            {isSelectedRegion && (
                              <span className="ml-2 text-xs bg-sonance-blue text-white px-2 py-0.5 rounded">
                                Selected Region
                              </span>
                            )}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleSelectAllRepFirmsFromRegion(regionId)}
                            className="text-sm text-sonance-blue hover:underline"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {filtered.map((repFirm) => (
                            <label
                              key={repFirm.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={repFirmIds.includes(repFirm.id)}
                                onChange={() => handleRepFirmToggle(repFirm.id)}
                                className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                              />
                              <span className="text-sm text-foreground">{repFirm.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Unassigned rep firms */}
                  {filterRepFirms(unassignedRepFirms).length > 0 && (
                    <div className="border border-card-border rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-3 opacity-70">
                        No Region Assigned
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {filterRepFirms(unassignedRepFirms).map((repFirm) => (
                          <label
                            key={repFirm.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={repFirmIds.includes(repFirm.id)}
                              onChange={() => handleRepFirmToggle(repFirm.id)}
                              className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                            />
                            <span className="text-sm text-foreground">{repFirm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {repFirms.length === 0 && (
                    <p className="text-foreground opacity-60 text-center py-4">
                      No rep firms available. Add rep firms in the Manage section first.
                    </p>
                  )}
                </div>

                {repFirmIds.length > 0 && (
                  <p className="mt-4 text-sm text-foreground opacity-70">
                    {repFirmIds.length} rep firm{repFirmIds.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {/* Customer Assignment */}
            <div className="bg-card-bg rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-card-border">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  Customer Assignment
                </h2>
                <p className="text-sm text-foreground opacity-70">
                  Select strategic accounts this director manages
                </p>
              </div>
              <div className="p-6">
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
                    <label
                      key={customer.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={customerIds.includes(customer.id)}
                        onChange={() => handleCustomerToggle(customer.id)}
                        className="w-4 h-4 rounded border-card-border text-sonance-blue focus:ring-sonance-blue"
                      />
                      <span className="text-sm text-foreground">{customer.name}</span>
                    </label>
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
    </div>
  )
}
