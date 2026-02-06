'use client'

import { useMemo, useRef, useCallback } from 'react'
import { ReportData, ChannelConfig } from '@/app/report/page'

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
    // Backward compatibility: if no config, show rep_firm
    return sections.length > 0 ? sections : ['rep_firm']
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
      id: `new-${idCounter.current}-${Math.random().toString(36).slice(2, 9)}`,
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

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/,/g, '')) || 0
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">Regional Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Monthly Sales ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.monthlySales)}
            onChange={(e) => updateData({ monthlySales: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Monthly Goal ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.monthlyGoal)}
            onChange={(e) => updateData({ monthlyGoal: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            YTD Sales ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.ytdSales)}
            onChange={(e) => updateData({ ytdSales: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            YTD Goal ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.ytdGoal)}
            onChange={(e) => updateData({ ytdGoal: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Open Orders ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.openOrders)}
            onChange={(e) => updateData({ openOrders: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
            Pipeline ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.pipeline)}
            onChange={(e) => updateData({ pipeline: parseNumber(e.target.value) })}
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
                    <input
                      type="text"
                      value={formatNumber(firm.monthlySales)}
                      onChange={(e) => updateRepFirm(firm.id, 'monthlySales', parseNumber(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      YTD Sales ($)
                    </label>
                    <input
                      type="text"
                      value={formatNumber(firm.ytdSales)}
                      onChange={(e) => updateRepFirm(firm.id, 'ytdSales', parseNumber(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      % to Goal
                    </label>
                    <input
                      type="number"
                      value={firm.percentToGoal}
                      onChange={(e) => updateRepFirm(firm.id, 'percentToGoal', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-card-border rounded-lg bg-input-bg text-foreground focus:ring-2 focus:ring-sonance-blue focus:border-sonance-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
                      YoY Growth %
                    </label>
                    <input
                      type="number"
                      value={firm.yoyGrowth}
                      onChange={(e) => updateRepFirm(firm.id, 'yoyGrowth', parseFloat(e.target.value) || 0)}
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
