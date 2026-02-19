'use client'

import { useMemo, useRef, useCallback } from 'react'
import { ReportData, ChannelConfig } from '@/app/report/page'
import CurrencyInput from './CurrencyInput'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
  directorId?: string
  channelConfig?: ChannelConfig
}

const SECTION_LABELS: Record<string, { title: string; singular: string }> = {
  rep_firm: { title: 'Rep Firm Performance', singular: 'Rep Firm' },
  distributor: { title: 'Distributor Performance', singular: 'Distributor' },
  specialty_account: { title: 'Strategic Account Performance', singular: 'Strategic Account' },
  direct_customer: { title: 'Direct Customer Performance', singular: 'Customer' },
}

export default function SalesDataTab({ data, updateData, channelConfig }: Props) {
  // Determine which entity sections to show based on wizard config
  const activeSections = useMemo(() => {
    const sections = [...(channelConfig?.channel_types || [])]
    if (channelConfig?.uses_direct_customers) {
      sections.push('direct_customer')
    }
    // No channels configured: show all entity types for flexibility
    return sections.length > 0 ? sections : ['rep_firm', 'distributor', 'specialty_account']
  }, [channelConfig])

  // Get dropdown options for a given entity type
  const getOptionsForType = (entityType: string) => {
    if (entityType === 'direct_customer') {
      return channelConfig?.customers?.map(c => ({ id: c.id, name: c.name })) || []
    }
    return channelConfig?.entities
      ?.filter(e => e.entity_type === entityType)
      .map(e => ({ id: e.id, name: e.name })) || []
  }

  const idCounter = useRef(0)

  const addEntity = useCallback((entityType: string) => {
    idCounter.current += 1
    const newEntity = {
      id: `new-add-${idCounter.current}`,
      name: '',
      monthlySales: 0,
      ytdSales: 0,
      percentToGoal: 0,
      yoyGrowth: 0,
      entityType,
    }
    updateData({ repFirms: [...data.repFirms, newEntity] })
  }, [data.repFirms, updateData])

  const updateRepFirm = (id: string, field: string, value: string | number) => {
    // Handle phantom entity - promote to real entity on first interaction
    if (id.startsWith('empty-')) {
      const entityType = id.replace('empty-', '')
      idCounter.current += 1
      const newEntity = {
        id: `new-promote-${idCounter.current}`,
        name: field === 'name' ? String(value) : '',
        monthlySales: field === 'monthlySales' ? Number(value) : 0,
        ytdSales: field === 'ytdSales' ? Number(value) : 0,
        percentToGoal: field === 'percentToGoal' ? Number(value) : 0,
        yoyGrowth: field === 'yoyGrowth' ? Number(value) : 0,
        entityType,
      }
      updateData({ repFirms: [...data.repFirms, newEntity] })
      return
    }

    const updatedRepFirms = data.repFirms.map((firm) =>
      firm.id === id ? { ...firm, [field]: value } : firm
    )
    updateData({ repFirms: updatedRepFirms })
  }

  const removeRepFirm = (id: string, entityType: string) => {
    const sameTypeCount = data.repFirms.filter(f => f.entityType === entityType).length
    if (sameTypeCount <= 1) return
    updateData({ repFirms: data.repFirms.filter((firm) => firm.id !== id) })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Regional Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Monthly Sales ($)
          </label>
          <CurrencyInput
            value={data.monthlySales}
            onChange={(val) => updateData({ monthlySales: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Monthly Goal ($)
          </label>
          <CurrencyInput
            value={data.monthlyGoal}
            onChange={(val) => updateData({ monthlyGoal: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            YTD Sales ($)
          </label>
          <CurrencyInput
            value={data.ytdSales}
            onChange={(val) => updateData({ ytdSales: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            YTD Goal ($)
          </label>
          <CurrencyInput
            value={data.ytdGoal}
            onChange={(val) => updateData({ ytdGoal: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Open Orders ($)
          </label>
          <CurrencyInput
            value={data.openOrders}
            onChange={(val) => updateData({ openOrders: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Pipeline ($)
          </label>
          <CurrencyInput
            value={data.pipeline}
            onChange={(val) => updateData({ pipeline: val })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>
      </div>

      {/* Dynamic Entity Sections - one per configured channel type */}
      {activeSections.map((sectionType) => {
        const sectionEntities = data.repFirms.filter(f => f.entityType === sectionType)
        const label = SECTION_LABELS[sectionType] || { title: sectionType, singular: sectionType }
        const options = getOptionsForType(sectionType)

        // If no entities for this section yet, show at least one empty row
        const entitiesToRender = sectionEntities.length > 0
          ? sectionEntities
          : [{ id: `empty-${sectionType}`, name: '', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: sectionType }]

        return (
          <div key={sectionType} className="border-t border-card-border pt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wide">{label.title}</h2>

            {entitiesToRender.map((firm, index) => (
              <div key={firm.id} className="bg-sonance-blue/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {label.singular} #{index + 1}
                  </span>
                  {sectionEntities.length > 1 && (
                    <button
                      onClick={() => removeRepFirm(firm.id, sectionType)}
                      className="text-red-500 hover:text-red-700 text-sm uppercase tracking-wide"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      {label.singular} Name
                    </label>
                    {options.length > 0 ? (
                      <div className="flex gap-2">
                        <select
                          value={firm.name}
                          onChange={(e) => updateRepFirm(firm.id, 'name', e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                        >
                          <option value="">&mdash; Select {label.singular} &mdash;</option>
                          {options.map((option) => (
                            <option key={option.id} value={option.name}>
                              {option.name}
                            </option>
                          ))}
                          <option value="__custom__">Other (type custom name)</option>
                        </select>
                        {firm.name === '__custom__' || (firm.name && !options.some(o => o.name === firm.name)) ? (
                          <input
                            type="text"
                            value={firm.name === '__custom__' ? '' : firm.name}
                            onChange={(e) => updateRepFirm(firm.id, 'name', e.target.value)}
                            placeholder={`Enter ${label.singular.toLowerCase()} name`}
                            className="flex-1 px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                          />
                        ) : null}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={firm.name}
                        onChange={(e) => updateRepFirm(firm.id, 'name', e.target.value)}
                        placeholder={`e.g., ${sectionType === 'rep_firm' ? 'Pro Tech' : sectionType === 'distributor' ? 'Mexico Distribution Co' : sectionType === 'specialty_account' ? 'Strategic Partner Inc' : 'Acme Corporation'}`}
                        className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      Monthly Sales ($)
                    </label>
                    <CurrencyInput
                      value={firm.monthlySales}
                      onChange={(val) => updateRepFirm(firm.id, 'monthlySales', val)}
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      YTD Sales ($)
                    </label>
                    <CurrencyInput
                      value={firm.ytdSales}
                      onChange={(val) => updateRepFirm(firm.id, 'ytdSales', val)}
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      % to Goal
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={firm.percentToGoal || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        updateRepFirm(firm.id, 'percentToGoal', isNaN(val) ? 0 : val)
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      YoY Growth %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={firm.yoyGrowth || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        updateRepFirm(firm.id, 'yoyGrowth', isNaN(val) ? 0 : val)
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addEntity(sectionType)}
              className="px-4 py-2 bg-sonance-green text-white rounded-lg hover:bg-sonance-green/90 transition-colors font-semibold uppercase tracking-wide"
            >
              + Add Another {label.singular}
            </button>
          </div>
        )
      })}
    </div>
  )
}
